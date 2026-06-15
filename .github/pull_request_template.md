## ASAF Release PR Security Checklist
# Mirrors khepra-protocol PR template for a binary release repository.

> OWASP SDLC Culture Phase — Required for every PR to `main` in the ASAF release repo.

---

### A. Required for All PRs

- [ ] SHA-256 checksums in `bin/CHECKSUMS.txt` are updated for ALL new or modified binaries
- [ ] `bin/CHECKSUMS.txt` format validated: `<sha256hex>  <filename>` (two spaces)
- [ ] No private keys, seed files, or `.sealed` artifacts committed to the repo
- [ ] Binary was built from the signed, tagged commit in [EtherVerseCodeMate/giza-cyber-shield](https://github.com/EtherVerseCodeMate/giza-cyber-shield)
- [ ] CHANGELOG.md updated with the release version, date, and summary of changes

---

### B. For New Binary Releases

- [ ] Binary is PQC-signed (ML-DSA-65) — signature verified before publishing
- [ ] FIPS 140-3 build confirmed: compiled with `GOEXPERIMENT=boringcrypto`
- [ ] Binary has been scanned with Grype/Trivy before publishing (attach scan artifact)
- [ ] Version number follows semver: `vMAJOR.MINOR.PATCH`
- [ ] `publish_release.ps1` script has been dry-run successfully before merging

---

### C. For Key/Certificate Changes (`keys/` directory)

- [ ] No private keys committed — only `.pub` files allowed
- [ ] New public key has been validated against its corresponding private key
- [ ] Key purpose documented in commit message

---

### D. For Documentation Changes

- [ ] SECURITY.md is up to date with current supported versions
- [ ] No internal IP addresses, network topology, or classified data in docs
- [ ] README.md CHECKSUMS.txt table updated if new version released

---

### Reviewer Sign-Off

- [ ] SHA-256 checksums manually re-verified against the binary
- [ ] CI gate (verify-release.yml) is green
- [ ] No secrets detected by TruffleHog CI scan

---

**References**
- [OWASP Supply Chain Security](https://owasp.org/www-project-devsecops-guideline/)
- [NIST FIPS 204 — ML-DSA](https://csrc.nist.gov/pubs/fips/204/final)
- [NIST FIPS 203 — ML-KEM](https://csrc.nist.gov/pubs/fips/203/final)
