import { customAlphabet } from "nanoid";

export function generateVideoId() {
  const nanoid = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    12
  );

  const key = nanoid();

  return key;
}
