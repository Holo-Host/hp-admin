mod utils;
mod error;

use wasm_bindgen::prelude::*;

use argon2::{self, Config};
use ed25519_dalek::{SecretKey, Keypair as EdKeypair};
use base64::{encode};
pub use error::HoloCryptoError;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

struct KeyPair(EdKeypair);

impl KeyPair {
	pub fn new(passphrase: &str, salt: &str) -> Result<Self, HoloCryptoError> {
		// generate a 32 byte password hash using the Argon2 algo
		// password must be between 0 and 2^32 - 1 bytes
		// salt must be between 8 and 2^32 - 1 bytes
		let config = Config::default();
		let hash = argon2::hash_raw(passphrase.as_bytes(), salt.as_bytes(), &config)?;
		// use this as the secret key to then derive a public key from using Ed25519
		// this seems kinda strange but is taken out of the examples for the Ed25519 crate
		// which uses a cryptographic random number instead
		let secret = SecretKey::from_bytes(&hash)?;
		let public = (&secret).into();
		Ok(Self(EdKeypair{secret, public}))
	}

	/// Returns a base64 encoded signature of the payload
	pub fn sign(&self, payload: &str) -> Result<String, HoloCryptoError> {
		let sig_bytes = self.0.sign(payload.as_bytes()).to_bytes();
		Ok(encode(&sig_bytes[..]))
	}
}


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
	pub fn new(email: &str, pass: &str, salt: &str, happ_hash: &str) -> Result<WebUserKeyPair, JsValue> {
		let combined_passphrase = pass.to_owned() + email + happ_hash;
		Ok(Self(KeyPair::new(&combined_passphrase, salt)?))
	}

	#[wasm_bindgen]
	/// Returns a base64 encoded signature of the payload
	pub fn sign(&self, payload: &str) -> Result<String, JsValue> {
		Ok(self.0.sign(payload)?)
	}
}
