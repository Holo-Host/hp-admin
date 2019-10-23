//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;
use holo_crypto_wasm::{AdminKeyPair, WebUserKeyPair};

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn admin_can_derive_key_and_sign() {
	let akp = AdminKeyPair::new(
		"some@email.test",
		"p4ssw0rd",
		"HCA01adefasdtbeodbgahfawnf"
	).expect("Could not generate keypair");

	assert_eq!(
		akp.sign("message").expect("Could not sign payload").len(),
		88, // 64 bytes base64 encoded = 88 bits
	)
}

#[wasm_bindgen_test]
fn admin_will_error_if_salt_too_short() {
	assert!(
		AdminKeyPair::new("some@email.test", "pwd", "HCA01..").is_err()
	)
}

#[wasm_bindgen_test]
fn webuser_can_derive_key_and_sign() {
	let akp = WebUserKeyPair::new(
		"some@email.test",
		"p4ssw0rd",
		"saltysalt",
		"QmDnaHash..."
	).expect("Could not generate keypair");

	assert_eq!(
		akp.sign("message").expect("Could not sign payload").len(),
		88, // 64 bytes base64 encoded = 88 bits
	)
}

#[wasm_bindgen_test]
fn webuser_will_error_if_salt_too_short() {
	assert!(
		WebUserKeyPair::new("some@email.test", "pwd", "HCA01..", "QmDnaHash...").is_err()
	)
}
