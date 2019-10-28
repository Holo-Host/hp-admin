mod utils;
mod arg_checks;

use wasm_bindgen::prelude::*;

use holo_config_core::{admin_keypair_from, keypair_from, Keypair, PublicKey};

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

#[wasm_bindgen]
pub struct AdminKeyPair(Keypair);

#[wasm_bindgen]
impl AdminKeyPair {
    #[wasm_bindgen(constructor)]
    pub fn new(email: &str, pass: &str, hc_pub_key: &str) -> Result<AdminKeyPair, JsValue> {
        let hc_pub_key_bytes = hc_pub_key.as_bytes();
        let passphrase_bytes = pass.as_bytes();

        arg_checks::check_pubkey(hc_pub_key)?;
        arg_checks::check_passphrase(passphrase_bytes)?;

        // TODO: use the hcid encoding
        let hc_pub_key = PublicKey::from_bytes(hc_pub_key_bytes)
            .map_err(|e| HoloCryptoError::Custom(format!("{}", e)))?;
        Ok(Self(
            admin_keypair_from(hc_pub_key, email, pass)
                .map_err(|e| HoloCryptoError::Custom(format!("keypair generation failed: {}", e)))?,
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

        arg_checks::check_passphrase(passphrase_bytes)?;
        arg_checks::check_salt(salt_bytes)?;

        Ok(Self(
            keypair_from(
                passphrase_bytes,
                salt_bytes,
                happ_hash.as_bytes(),
                WEBUSER_ARGON_ADDITIONAL_DATA,
            )
            .map_err(|e| HoloCryptoError::Custom(format!("keypair generation failed: {}", e)))?,
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
