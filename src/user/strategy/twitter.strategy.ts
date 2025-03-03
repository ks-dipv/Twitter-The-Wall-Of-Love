import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-twitter';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor(private configService: ConfigService) {
    super({
      consumerKey: configService.get<string>('TWITTER_CONSUMER_KEY'),
      consumerSecret: configService.get<string>('TWITTER_CONSUMER_SECRET'),
      callbackURL: configService.get<string>('TWITTER_CALLBACK_URL'),
      includeEmail: true, // Get user email if available
      passReqToCallback: true,
    });
  }

  async validate(token: string, tokenSecret: string, profile: any) {
    return {
      twitterId: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      profileImage: profile.photos?.[0]?.value || null,
      email: profile.emails?.[0]?.value || null,
      token,
      tokenSecret,
    };
  }
}
