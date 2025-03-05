import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TwitterService {
  constructor(private readonly config: ConfigService) {}

  async fetchTweetDetails(tweetUrl: string): Promise<any> {
    if (!tweetUrl || typeof tweetUrl !== 'string') {
      console.log('tweetUrl is invalid:', tweetUrl, typeof tweetUrl);
      throw new BadRequestException('Invalid tweet URL provided');
    }

    const match = tweetUrl.match(/status\/(\d+)/);
    if (!match || !match[1]) {
      throw new BadRequestException('Invalid tweet URL format');
    }

    const token = this.config.get('TWITTER_BEARER_TOKEN');

    const tweetId = match[1];

    try {
      const response = await axios.get(
        `https://api.twitter.com/2/tweets/${tweetId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            'tweet.fields': 'created_at,public_metrics',
            expansions: 'author_id',
            'user.fields': 'name,profile_image_url',
          },
        },
      );

      if (!response.data || !response.data.data) {
        throw new BadRequestException('Failed to retrieve tweet details');
      }

      const tweetData = response.data.data;
      const userData = response.data.includes?.users?.[0];

      return {
        tweet_url: tweetUrl,
        content: tweetData.text,
        author_name: userData?.name || 'Unknown',
        author_profile_pic: userData.profile_image_url,
        author_profile_link: userData
          ? `https://twitter.com/${userData.username}`
          : null,
        likes: tweetData.public_metrics.like_count || 0,
        comments: tweetData.public_metrics.reply_count || 0,
      };
    } catch (error) {
      console.error('Error fetching tweet details:', error);
      throw new BadRequestException(
        `Failed to fetch tweet details: ${error.message}`,
      );
    }
  }
}
