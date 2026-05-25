# Runbook — migrate nfyll.org mail to the NFYLL nonprofit M365 tenant

Plan task #5. Mirrors the FILC mail migration that ran 2026-04-23.

**Blast radius**: HIGH. The MX cutover step locks board@nfyll.org out of email
if botched. Schedule a quiet window before starting; do NOT bundle with the
website launch.

**Estimated time**: ~90 min of clicking + a 24h DKIM/DMARC propagation wait.

---

## Pre-flight (10 min)

Before touching anything, snapshot the current state so you can verify the
cutover and roll back if needed.

```bash
# Current state (record this in a scratch buffer)
dig nfyll.org MX +short          # expect: 0 nfyll-org.mail.protection.outlook.com.
dig nfyll.org TXT +short          # expect: NETORGFT12532574.onmicrosoft.com + secureserver SPF
dig autodiscover.nfyll.org CNAME +short  # check if one exists
dig selector1._domainkey.nfyll.org CNAME +short
dig selector2._domainkey.nfyll.org CNAME +short
dig _dmarc.nfyll.org TXT +short  # expect: empty
```

Save the output. The current MX `nfyll-org.mail.protection.outlook.com.` and
TXT `NETORGFT12532574.onmicrosoft.com` are the "before" baseline.

## Step 1 — Confirm NFYLL tenant is ready (5 min)

The NFYLL tenant `nfyll.onmicrosoft.com` should already exist (provisioned
when the Goodstack-issued M365 Nonprofit grant landed). Verify:

1. Sign into [admin.microsoft.com](https://admin.microsoft.com/) as the NFYLL
   Global Admin (e.g. `vernon@nfyll.onmicrosoft.com`) — **not** vernon@filc.us.
   The top-right header should read "North Florida Lacrosse Inc." or similar
   NFYLL identifier, not "Fleming Island Lacrosse Inc."
2. Confirm at least one M365 license (Business Basic / Premium per the grant)
   is available: **Billing → Licenses**.
3. Confirm the Global Admin role is on a NFYLL-owned account, not on
   `vernon@filc.us`. The two tenants stay separate.

If any of those is wrong, fix before going further — the rest of the runbook
assumes a clean NFYLL tenant.

## Step 2 — Add `nfyll.org` as a custom domain on the new tenant (10 min)

1. M365 admin → **Settings → Domains → Add domain** → `nfyll.org`.
2. Microsoft issues a verification TXT (looks like `MS=ms#######`).
3. Add the TXT to GoDaddy DNS:
   ```bash
   # Pattern for FILC's dns-set-record.sh wrapper (per reference_dns_automation.md)
   source "/Volumes/Crucial X10/portable-env/secrets/dns-api-tokens.env"
   dns-set-record.sh nfyll.org TXT '@' 'MS=ms#######'
   ```
4. Wait ~5 min for propagation, click **Verify** in M365 admin.

Do NOT yet click "Set up Online Services" / "Update DNS records" in
Microsoft's wizard — that would prematurely flip MX/SPF/Autodiscover. We'll
do those in step 4 after staging the mailboxes.

## Step 3 — Provision the new mailboxes (10 min)

Three mailboxes per plan §2 (only `board@` migrates; the others are new):

1. **Users → Active users → Add a user**:
   - `board@nfyll.org` — placeholder; we'll soft-merge with the GoDaddy
     mailbox in step 5. License: Business Basic (or whatever the grant covers).
   - `vernon@nfyll.org` — admin/automation. Same license tier.
   - `info@nfyll.org` — public inbound. **Convert to Shared Mailbox** after
     creation (Users → Active users → select user → Convert to shared) so it
     doesn't burn a license seat. Mirrors FILC's info@ pattern.
2. Set strong passwords; record in a password manager. The vernon@ password
   should match the operator-SP convention so automation can sign in.
3. Sign into each via OWA at outlook.office.com to confirm the mailbox
   provisions cleanly. Send a test internal message between the three.

## Step 4 — DKIM enable on `nfyll.org` (5 min, then 24h wait)

1. M365 admin → **Setup → Domains → nfyll.org → DNS records → Email
   security → DKIM** → toggle **Sign messages for this domain with DKIM
   signatures**.
2. Microsoft emits two CNAME records:
   ```
   selector1._domainkey.nfyll.org → selector1-nfyll-org._domainkey.<tenant>.onmicrosoft.com
   selector2._domainkey.nfyll.org → selector2-nfyll-org._domainkey.<tenant>.onmicrosoft.com
   ```
3. Add both to GoDaddy DNS:
   ```bash
   dns-set-record.sh nfyll.org CNAME selector1._domainkey '<value-from-portal>'
   dns-set-record.sh nfyll.org CNAME selector2._domainkey '<value-from-portal>'
   ```
4. Back in the portal click **Enable** — it may need ~15 min for the
   selectors to resolve before it'll let you flip the toggle. If it errors,
   wait and retry; don't proceed without DKIM live.

## Step 5 — Migrate the existing `board@nfyll.org` mailbox content (15–30 min)

The current `board@nfyll.org` mailbox lives on the GoDaddy-resold tenant
`NETORGFT12532574`. Content is small (single mailbox, low volume) so an
**IMAP migration is the simplest option**:

1. From the **old** mailbox (sign into outlook.office.com with the GoDaddy-
   resold credentials Dave already has), enable IMAP if disabled.
2. From the **new** mailbox in M365 admin, set up an IMAP migration batch:
   **Setup → Migration → New migration batch → IMAP migration**.
3. Source server: `outlook.office365.com:993` SSL. Authenticate as the old
   mailbox.
4. Map old `board@nfyll.org` → new `board@nfyll.org`. Run. Status visible
   under Migration → batches.
5. Wait for `Synced` status. Verify in OWA on the new mailbox that all
   folders, sent items, calendars, and contacts came across.

Alternative if IMAP is rejected: export `.pst` from the old mailbox via OWA
or Outlook desktop, import into the new mailbox the same way. Same
end-state, slower.

## Step 6 — The MX cutover (5 min, then 1–24h propagation)

**This is the high-blast-radius step.** Once MX flips, all new mail goes
to the new tenant. Existing mail in the old tenant stays there until you
delete it (or until GoDaddy retires the resold tenant).

1. Get the exact MX target from the new tenant: M365 admin → Domains →
   nfyll.org → DNS records → shows the canonical
   `<dashed>.mail.protection.outlook.com` value.
2. Update GoDaddy DNS:
   ```bash
   dns-set-record.sh nfyll.org MX '@' '0 <dashed>-nfyll-org.mail.protection.outlook.com'
   ```
3. Update SPF (replace the GoDaddy/secureserver include):
   ```bash
   dns-set-record.sh nfyll.org TXT '@' 'v=spf1 include:spf.protection.outlook.com -all'
   ```
4. Update Autodiscover (if it points anywhere now):
   ```bash
   dns-set-record.sh nfyll.org CNAME autodiscover autodiscover.outlook.com
   ```
5. Verify cutover:
   ```bash
   dig nfyll.org MX +short                    # expect: 0 <dashed>-nfyll-org.mail.protection.outlook.com
   dig nfyll.org TXT +short | grep spf1       # expect: v=spf1 include:spf.protection.outlook.com -all
   dig autodiscover.nfyll.org CNAME +short    # expect: autodiscover.outlook.com.
   ```
6. Send a test email from an external Gmail / iCloud / wherever to
   `board@nfyll.org`. Confirm it lands in the new mailbox (OWA) within ~5
   min. Check headers — `Received` chain should show
   `<dashed>.mail.protection.outlook.com`, NOT `nfyll-org.mail.protection.outlook.com`.

## Step 7 — Detach `nfyll.org` from the GoDaddy-resold tenant (5 min)

Mirrors the FILC migration's "golden rule": orphan the old tenant cleanly.

1. Sign into the OLD GoDaddy-resold M365 admin (NETORGFT12532574) — Dave's
   GoDaddy account → Email & Office.
2. Domains → remove `nfyll.org` from the resold tenant.
3. **Do NOT re-attach later.** The NETORG tenant orphans cleanly the way
   FILC's did. Document the tenant ID in `~/Volumes/Crucial X10/nfyll-legal-docs/orphan-tenant.txt`
   in case it surfaces in some future audit.

## Step 8 — Publish DMARC `p=none` (5 min)

Per `project_dmarc_incident_2026_05_01.md`: **start at `p=none`**, never
escalate without a `pct=` ramp. NFYLL's mail volume is tiny so this stays
at `p=none` indefinitely unless real spoofing surfaces.

```bash
dns-set-record.sh nfyll.org TXT '_dmarc' \
  'v=DMARC1; p=none; rua=mailto:dmarc@nfyll.org; ruf=mailto:dmarc@nfyll.org; fo=1'
```

(Or `rua=mailto:vernon@nfyll.org` if you'd rather get the reports there
directly. `dmarc@nfyll.org` is optional — create as a shared mailbox or
forwarder to vernon@.)

Verify:
```bash
dig _dmarc.nfyll.org TXT +short
```

## Verification — green checks at the end

| Check | Command | Expected |
|---|---|---|
| MX flipped | `dig nfyll.org MX +short` | new `<dashed>.mail.protection.outlook.com` |
| Old MX gone | (same) | NOT `nfyll-org.mail.protection.outlook.com` |
| SPF updated | `dig nfyll.org TXT +short` | `v=spf1 include:spf.protection.outlook.com -all` |
| DKIM live | external mail headers | `DKIM-Signature: ... d=nfyll.org; s=selector1; ...` valid |
| DMARC published | `dig _dmarc.nfyll.org TXT +short` | `v=DMARC1; p=none; rua=...` |
| Old tenant detached | sign into NETORGFT12532574 admin | `nfyll.org` no longer listed |
| Test inbound | mail external → board@nfyll.org | lands in new OWA within 5 min |
| Test outbound | OWA send → external | lands; headers show new tenant |
| Migration delta | OWA on new vs old mailbox | folders, sent, calendars all present |

## Rollback (if anything explodes mid-cutover)

The reversible step is **Step 6 MX flip**. Revert by:
```bash
dns-set-record.sh nfyll.org MX '@' '0 nfyll-org.mail.protection.outlook.com'
dns-set-record.sh nfyll.org TXT '@' 'v=spf1 include:secureserver.net -all'
```
Mail routing returns to the old tenant within ~5 min. Any new mail that
landed on the new tenant in the meantime stays there — you'd need to
manually forward or re-migrate.

Steps 1–5 are non-destructive (adding things, not flipping MX) so they're
safe to do early. Steps 7–8 are post-cutover cleanup; if you bail at step 6
the old tenant is still authoritative.
