mod utils;

use wasm_bindgen::prelude::*;

use holo_crypto::{error::HoloCryptoError, KeyPair};

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct AdminKeyPair(KeyPair);

#[wasm_bindgen]
impl AdminKeyPair {
    #[wasm_bindgen(constructor)]
    pub fn new(email: &str, pass: &str, hc_pub_key: &str) -> Result<AdminKeyPair, JsValue> {
        let combined_passphrase = pass.to_owned() + email;
        Ok(Self(KeyPair::new(&combined_passphrase, &hc_pub_key)?))
    }

    #[wasm_bindgen]
    /// Returns a base64 encoded signature of the payload
    pub fn sign(&self, payload: &str) -> Result<String, JsValue> {
        Ok(self.0.sign(payload)?)
    }
}

#[wasm_bindgen]
pub struct WebUserKeyPair(KeyPair);

#[wasm_bindgen]
impl WebUserKeyPair {
    #[wasm_bindgen(constructor)]
    pub fn new(
        email: &str,
        pass: &str,
        salt: &str,
        happ_hash: &str,
    ) -> Result<WebUserKeyPair, JsValue> {
        let combined_passphrase = pass.to_owned() + email + happ_hash;
        Ok(Self(KeyPair::new(&combined_passphrase, salt)?))
    }

    #[wasm_bindgen]
    /// Returns a base64 encoded signature of the payload
    pub fn sign(&self, payload: &str) -> Result<String, JsValue> {
        Ok(self.0.sign(payload)?)
    }
}
