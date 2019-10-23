import { AdminKeyPair } from "holo-crypto";

/// Profiles a given function 'reps' times and returns the average
const profile = (name, f, reps) => {
  let times = []
  for (let i = 0; i < reps; i++) {
    const start = window.performance.now()
    f(i)
    const diff = window.performance.now() - start
    console.log(name, i, ":", diff, "ms")
    times.push(diff)
  }
  const sum = times.reduce(function(a, b) { return a + b }, 0)
  return sum / times.length  
}

const profile_keygen = (reps) => {
  return profile("Admin keygen", () => {
    const kp = new AdminKeyPair(
      "some@email.test",
      "p4ssw0rd",
      "HCA01adefasdtbeodbgahfawnf"
    )
  }, reps)
}

const profile_signing = (reps) => {
  const kp = new AdminKeyPair(
    "some@email.test",
    "p4ssw0rd",
    "HCA01adefasdtbeodbgahfawnf"
  )
  return profile("Admin signing", () => {
    kp.sign("some message")
  }, reps)
}

const keygen_avg =  profile_keygen(10)
const signing_avg = profile_signing(100)

console.log("Admin key pair generation:", keygen_avg, "ms (average)")
console.log("Admin key pair signing:", signing_avg, "ms (average)")
