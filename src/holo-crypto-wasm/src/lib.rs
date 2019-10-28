mod utils;

use wasm_bindgen::prelude::*;

// use holo_crypto::{KeyPair};
use holo_config_core::{admin_keypair_from, keypair_from, Keypair, PublicKey};

const ARGON2_MAX_PASSPHRASE_LEN: usize = (2 ^ 32) - 1;
const ARGON2_MAX_SALT_LEN: usize = (2 ^ 32) - 1;
const ARGON2_MIN_SALT_LEN: usize = 8;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Debug)]
enum HoloCryptoError {
    Custom(String),
}

impl From<HoloCryptoError> for JsValue {
    fn from(e: HoloCryptoError) -> Self {
        JsValue::from_str(&format!("{:?}", e).to_string())
    }
}

fn check_passphrase(passphrase_bytes: &[u8]) -> Result<(), HoloCryptoError> {
    if passphrase_bytes.len() > ARGON2_MAX_PASSPHRASE_LEN {
        return Err(HoloCryptoError::Custom(
            "Passphrase exceeds maximum allowable number of bytes".to_string(),
        ))
    } else {
        return Ok(())
    }
}

fn check_pubkey(hc_pub_key: &str) -> Result<(), HoloCryptoError> {
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

fn check_salt(salt_bytes: &[u8]) -> Result<(), HoloCryptoError> {
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

#[wasm_bindgen]
pub struct AdminKeyPair(Keypair);

#[wasm_bindgen]
impl AdminKeyPair {
    #[wasm_bindgen(constructor)]
    pub fn new(email: &str, pass: &str, hc_pub_key: &str) -> Result<AdminKeyPair, JsValue> {
        let hc_pub_key_bytes = hc_pub_key.as_bytes();
        let passphrase_bytes = pass.as_bytes();

        check_pubkey(hc_pub_key)?;
        check_passphrase(passphrase_bytes)?;

        let hc_pub_key = PublicKey::from_bytes(hc_pub_key_bytes)
            .map_err(|e| HoloCryptoError::Custom(format!("{}", e)))?;
        Ok(Self(
            admin_keypair_from(hc_pub_key, email, pass)
                .map_err(|e| HoloCryptoError::Custom(format!("{}", e)))?,
        ))
    }

    #[wasm_bindgen]
    /// Returns a base64 encoded signature of the payload
    pub fn sign(&self, payload: &str) -> Result<String, JsValue> {
        let sig_bytes = self.0.sign(payload.as_bytes()).to_bytes();
        Ok(base64::encode_config(
            &sig_bytes[..],
            base64::STANDARD_NO_PAD,
        ))
    }
}

#[wasm_bindgen]
pub struct WebUserKeyPair(Keypair);

const WEBUSER_ARGON_ADDITIONAL_DATA: &[u8] = b"holo-crypto webuser ed25519 key v1";

#[wasm_bindgen]
impl WebUserKeyPair {
    #[wasm_bindgen(constructor)]
    pub fn new(
        _email: &str,
        pass: &str,
        salt: &str,
        happ_hash: &str,
    ) -> Result<WebUserKeyPair, JsValue> {
        let salt_bytes = salt.as_bytes();
        let passphrase_bytes = pass.as_bytes();

        check_passphrase(passphrase_bytes)?;
        check_salt(salt_bytes)?;

        Ok(Self(
            keypair_from(
                passphrase_bytes,
                salt_bytes,
                happ_hash.as_bytes(),
                WEBUSER_ARGON_ADDITIONAL_DATA,
            )
            .map_err(|e| HoloCryptoError::Custom(format!("{}", e)))?,
        ))
    }

    #[wasm_bindgen]
    /// Returns a base64 encoded signature of the payload
    pub fn sign(&self, payload: &str) -> Result<String, JsValue> {
        let sig_bytes = self.0.sign(payload.as_bytes()).to_bytes();
        Ok(base64::encode_config(
            &sig_bytes[..],
            base64::STANDARD_NO_PAD,
        ))
    }
}
