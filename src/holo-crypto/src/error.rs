use wasm_bindgen::JsValue;

#[derive(Debug)]
pub enum HoloCryptoError {
	ArgonError(argon2::Error),
	Ed25519Error(ed25519_dalek::SignatureError),
}

impl From<argon2::Error> for HoloCryptoError {
	fn from(argon_error: argon2::Error) -> Self {
		HoloCryptoError::ArgonError(argon_error)
	}
}

impl From<ed25519_dalek::SignatureError> for HoloCryptoError {
	fn from(ed25519_error: ed25519_dalek::SignatureError) -> Self {
		HoloCryptoError::Ed25519Error(ed25519_error)
	}
}

impl From<HoloCryptoError> for JsValue {
	fn from(_error: HoloCryptoError) -> JsValue {
		JsValue::from_str("")
	}
}
