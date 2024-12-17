import { sendMessage } from "./chefToEmploye/startMessage.js";
import { getMessages } from "./chefToEmploye/fetchMessage.js";

export const StartMessController = Object.freeze({
  sendMessage
});

export const FetchMessController = Object.freeze({
  getMessages
});