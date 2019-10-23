pub mod error;

use argon2min::Argon2;
use ed25519_dalek::{SecretKey, Keypair as EdKeypair, SECRET_KEY_LENGTH};
use base64::{encode};
pub use error::HoloCryptoError;

pub struct KeyPair(EdKeypair);

const ARGON2_ADDITIONAL_DATA: &[u8] = b"holocrypto";
const ARGON2_MAX_PASSPHRASE_LEN: usize = 2^32-1;
const ARGON2_MAX_SALT_LEN: usize = 2^32-1;
const ARGON2_MIN_SALT_LEN: usize = 8;

impl KeyPair {
	/// Create a new keypair given a passphrase and salt
	/// Passphrase must be between 0 and 2^32-1 bytes
	/// Salt must be between 8 and 2^32 - 1 bytes
	pub fn new(passphrase: &str, salt: &str) -> Result<Self, HoloCryptoError> {

		let passphrase_bytes = passphrase.as_bytes();
		let salt_bytes = salt.as_bytes();
		if passphrase_bytes.len() > ARGON2_MAX_PASSPHRASE_LEN {
			return Err(HoloCryptoError::Custom("Passphrase exceeds maximum allowable number of bytes".to_string()))
		}
		match salt_bytes.len() {
			0..=ARGON2_MIN_SALT_LEN => Err(HoloCryptoError::Custom("Salt must be at least 8 bytes".to_string())),
			ARGON2_MIN_SALT_LEN..=ARGON2_MAX_SALT_LEN => Ok(()),
			_ => Err(HoloCryptoError::Custom("Salt exceeds maximum allowable number of bytes".to_string()))			
		}?;

		// generate a 32 byte password hash using the Argon2 algo
		let mut secretkey_bytes = [0; SECRET_KEY_LENGTH];

		//The number of block matrix iterations to perform. Increasing
		// this forces hashing to take longer. Must be between 1 and 2^32 - 1.
		let passes = 2; 
    					
		// The degree of parallelism by which memory is filled during hash
		// computation. Setting this to N instructs argon2min to partition the block
		// matrix into N lanes, simultaneously filling each lane in parallel with N
		// threads. Must be between 1 and 2^24 - 1.
		let lanes = 4; 	
					    
		// Desired total size of block matrix, in kibibytes (1 KiB = 1024
		// bytes). Increasing this forces hashing to use more memory in order to
		// thwart ASIC-based attacks. Must be >= 8 * lanes.
		let block_matrix_size = 1 << 16; 	

		// some extra bytes that can be optionally included
		let optional_secret_value = [];

		Argon2::new(passes, lanes, block_matrix_size, argon2min::Variant::Argon2id)?
        	.hash(&mut secretkey_bytes, &passphrase_bytes, &salt_bytes, &optional_secret_value, ARGON2_ADDITIONAL_DATA);

		// use this as the secret key to then derive a public key from using Ed25519
		// this seems kinda strange but is taken out of the examples for the Ed25519 crate
		// which uses a cryptographic random number instead
		let secret = SecretKey::from_bytes(&secretkey_bytes)?;
		let public = (&secret).into();
		Ok(Self(EdKeypair{secret, public}))
	}

	/// Returns a base64 encoded signature of the payload
	pub fn sign(&self, payload: &str) -> Result<String, HoloCryptoError> {
		let sig_bytes = self.0.sign(payload.as_bytes()).to_bytes();
		Ok(encode(&sig_bytes[..]))
	}
}
