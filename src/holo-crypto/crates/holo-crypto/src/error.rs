
use wasm_bindgen::JsValue;

#[derive(Debug)]
pub enum HoloCryptoError {
	ArgonError(argon2min::ParamErr),
	Ed25519Error(ed25519_dalek::SignatureError),
	Custom(String),
}

impl From<argon2min::ParamErr> for HoloCryptoError {
	fn from(argon_error: argon2min::ParamErr) -> Self {
		HoloCryptoError::ArgonError(argon_error)
	}
}

impl From<ed25519_dalek::SignatureError> for HoloCryptoError {
	fn from(ed25519_error: ed25519_dalek::SignatureError) -> Self {
		HoloCryptoError::Ed25519Error(ed25519_error)
	}
}

impl From<HoloCryptoError> for JsValue {
	fn from(error: HoloCryptoError) -> JsValue {
		// could probably shave some bytes off the wasm size by not using format!
		JsValue::from_str(&format!("{:?}", error))
	}
}
