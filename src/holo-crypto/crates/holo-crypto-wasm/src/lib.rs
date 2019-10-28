mod utils;


use wasm_bindgen::prelude::*;

// use holo_crypto::{KeyPair};
use holo_config_core::{admin_keypair_from, keypair_from, Keypair, PublicKey};

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct AdminKeyPair(Keypair);

#[wasm_bindgen]
impl AdminKeyPair {
    #[wasm_bindgen(constructor)]
    pub fn new(email: &str, pass: &str, hc_pub_key: &str) -> Result<AdminKeyPair, JsValue> {
        let hc_pub_key = PublicKey::from_bytes(hc_pub_key.as_bytes()).unwrap();
        Ok(Self(admin_keypair_from(hc_pub_key, email, pass).unwrap()))
    }

    #[wasm_bindgen]
    /// Returns a base64 encoded signature of the payload
    pub fn sign(&self, payload: &str) -> Result<String, JsValue> {
        let sig_bytes = self.0.sign(payload.as_bytes()).to_bytes();
        Ok(base64::encode(&sig_bytes[..]))
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
        Ok(Self(keypair_from(
            pass.as_bytes(),
            salt.as_bytes(),
            happ_hash.as_bytes(),
            WEBUSER_ARGON_ADDITIONAL_DATA,
        ).unwrap()))
    }

    #[wasm_bindgen]
    /// Returns a base64 encoded signature of the payload
    pub fn sign(&self, payload: &str) -> Result<String, JsValue> {
        let sig_bytes = self.0.sign(payload.as_bytes()).to_bytes();
        Ok(base64::encode(&sig_bytes[..]))
    }
}
