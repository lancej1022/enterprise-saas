import * as SecureStore from "expo-secure-store";

const key = "session_token";
export function getToken() {
  return SecureStore.getItem(key);
}
export function deleteToken() {
  return SecureStore.deleteItemAsync(key);
}
export function setToken(v: string) {
  return SecureStore.setItem(key, v);
}
