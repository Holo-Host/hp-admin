use crate::HoloCryptoError;

const ARGON2_MAX_PASSPHRASE_LEN: usize = (2 ^ 32) - 1;
const ARGON2_MAX_SALT_LEN: usize = (2 ^ 32) - 1;
const ARGON2_MIN_SALT_LEN: usize = 8;

pub(crate) fn check_passphrase(passphrase_bytes: &[u8]) -> Result<(), HoloCryptoError> {
    if passphrase_bytes.len() > ARGON2_MAX_PASSPHRASE_LEN {
        return Err(HoloCryptoError::Custom(
            "Passphrase exceeds maximum allowable number of bytes".to_string(),
        ))
    } else {
        return Ok(())
    }
}

pub(crate) fn check_pubkey(hc_pub_key: &str) -> Result<(), HoloCryptoError> {
    // TODO: Actually decode this properly
    let hc_pub_key_bytes = hc_pub_key.as_bytes();
    if hc_pub_key_bytes.len() != 32 {
        return Err(HoloCryptoError::Custom(format!(
            "Expected hc_pub_key to be 32 bytes long, found {}",
            hc_pub_key_bytes.len()
        )))
    } else {
        Ok(())
    }
}

pub(crate) fn check_salt(salt_bytes: &[u8]) -> Result<(), HoloCryptoError> {
    match salt_bytes.len() {
        0..=ARGON2_MIN_SALT_LEN if salt_bytes.len() < ARGON2_MIN_SALT_LEN => Err(
            HoloCryptoError::Custom("Salt must be at least 8 bytes".to_string()),
        ),
        ARGON2_MIN_SALT_LEN..=ARGON2_MAX_SALT_LEN => Ok(()),
        _ => Err(HoloCryptoError::Custom(
            "Salt exceeds maximum allowable number of bytes".to_string(),
        )),
    }
}
