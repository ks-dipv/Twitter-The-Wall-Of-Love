import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class XUserHandleService {
  constructor(private readonly config: ConfigService) {}

  async fetchTweetsDetailsByXHandle(userUrl: string): Promise<any[]> {
    if (!userUrl || typeof userUrl !== 'string') {
      throw new Error('Invalid user URL provided');
    }
    const match = userUrl.match(/\/([^\/]+)$/);
    if (!match || !match[1]) {
      throw new Error('Invalid user URL format');
    }
    const token = this.config.get<string>('TWITTER_BEARER_TOKEN');
    if (!token) {
      throw new Error('Twitter API token is not configured');
    }
    const user = match[1];
    try {
      const userDetails = await axios.get(
        `https://api.twitter.com/2/users/by/username/${user}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const userId = userDetails.data.data.id;

      const response = await axios.get(
        `https://api.twitter.com/2/users/${userId}/tweets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            'tweet.fields': 'text,created_at,public_metrics',
            expansions: 'author_id',
            'user.fields': 'name,profile_image_url,username',
            max_results: 10,
          },
        },
      );

      if (!response.data?.data) {
        throw new BadRequestException('Failed to retrieve tweet details');
      }

      const tweets = Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];

      if (tweets.length === 0) {
        throw new BadRequestException('No tweets found for this user');
      }

      const userData = response.data.includes?.users?.[0] || {};

      return tweets.map((tweet) => ({
        tweet_url: `https://twitter.com/${userData.username}/status/${tweet.id}`,
        content: tweet.text,
        author_name: userData.name || 'Unknown',
        author_profile_pic: userData.profile_image_url || null,
        author_profile_link: userData.username
          ? `https://twitter.com/${userData.username}`
          : null,
        likes: tweet.public_metrics?.like_count || 0,
        comments: tweet.public_metrics?.reply_count || 0,
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Twitter API error: ${error.response?.data?.title || 'Unknown error'}`,
        );
      }

      throw new InternalServerErrorException('Failed to fetch tweet details');
    }
  }
}
