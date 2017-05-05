/* eslint-disable class-methods-use-this */
import warning from 'warning';

import FBGraphAPIClient from '../api/FBGraphAPIClient';
import MessengerContext from '../session/MessengerContext';

import Connecter from './Connector';

export default class MessengerConnector extends Connecter {
  constructor(accessToken) {
    super();
    this._graphAPIClient = FBGraphAPIClient.factory(accessToken);
  }

  get platform(): string {
    return 'messenger';
  }

  getSenderIdFromRequest(request) {
    const rawEvent = this._getRawEventFromRequest(request);
    if (rawEvent.message && rawEvent.message.is_echo) {
      return rawEvent.recipient.id;
    }
    return rawEvent.sender.id;
  }

  async getUserProfile(senderId) {
    const { data } = await this._graphAPIClient.getUserProfile(senderId);
    return data;
  }

  async handleRequest({ request, sessionData, db }) {
    const rawEvent = this._getRawEventFromRequest(request);

    const context = new MessengerContext({
      graphAPIClient: this._graphAPIClient,
      rawEvent,
      data: sessionData,
      db,
    });

    await Promise.resolve(
      this._handler(context, {
        get message() {
          warning(false, 'access message on second argument is deprecated.');
          return rawEvent.message;
        },
        get postback() {
          warning(false, 'access postback on second argument is deprecated.');
          return rawEvent.postback;
        },
      })
    );
  }

  _getRawEventFromRequest(request) {
    return request.body.entry[0].messaging[0];
  }
}