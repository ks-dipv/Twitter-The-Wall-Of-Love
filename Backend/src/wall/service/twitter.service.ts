import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TwitterService {
  constructor(private readonly config: ConfigService) {}

  async fetchTweetDetails(tweetUrl: string): Promise<any> {
    if (!tweetUrl || typeof tweetUrl !== 'string') {
      throw new BadRequestException('Invalid tweet URL provided');
    }

    const match = tweetUrl.match(/status\/(\d+)/);
    if (!match || !match[1]) {
      throw new BadRequestException('Invalid tweet URL format');
    }

    const token = this.config.get<string>('TWITTER_BEARER_TOKEN');
    if (!token) {
      throw new InternalServerErrorException(
        'Twitter API token is not configured',
      );
    }

    const tweetId = match[1];

    try {
      const response = await axios.get(
        `https://api.twitter.com/2/tweets/${tweetId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            'tweet.fields': 'text,created_at,public_metrics',
            expansions: 'author_id',
            'user.fields': 'name,profile_image_url,username',
          },
        },
      );

      if (!response.data?.data) {
        throw new BadRequestException('Failed to retrieve tweet details');
      }

      const tweetData = response.data.data;
      const userData = response.data.includes?.users?.[0] || {};

      return {
        tweet_url: tweetUrl,
        content: tweetData.text,
        author_name: userData.name || 'Unknown',
        author_profile_pic: userData.profile_image_url || null,
        author_profile_link: userData.username
          ? `https://twitter.com/${userData.username}`
          : null,
        likes: tweetData.public_metrics?.like_count || 0,
        comments: tweetData.public_metrics?.reply_count || 0,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Twitter API error: ${error.response?.data?.title || 'Unknown error'}`,
        );
      }

      throw new InternalServerErrorException('Failed to fetch tweet details');
    }
  }
  async fetchTweetsByHashtag(
    hashtag: string,
    maxResults: number = 10,
  ): Promise<any[]> {
    if (!hashtag || typeof hashtag !== 'string') {
      throw new BadRequestException('Invalid hashtag provided');
    }

    const token = this.config.get<string>('TWITTER_BEARER_TOKEN');
    if (!token) {
      throw new InternalServerErrorException(
        'Twitter API token is not configured',
      );
    }

    try {
      const response = await axios.get(
        `https://api.twitter.com/2/tweets/search/recent`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            query: `#${hashtag}`,
            max_results: maxResults,
            'tweet.fields': 'text,created_at,public_metrics',
            expansions: 'author_id',
            'user.fields': 'name,profile_image_url,username',
          },
        },
      );

      if (!response.data?.data) {
        throw new BadRequestException('No tweets found for the given hashtag');
      }

      const tweets = response.data.data;
      const users = response.data.includes?.users || [];

      // Combine tweet data with author data
      return tweets.map((tweet) => {
        const user = users.find((user) => user.id === tweet.author_id);
        return {
          tweet_url: `https://twitter.com/${user.username}/status/${tweet.id}`,
          content: tweet.text,
          author_name: user.name,
          author_profile_pic: user.profile_image_url,
          author_profile_link: `https://twitter.com/${user.username}`,
          likes: tweet.public_metrics?.like_count || 0,
          comments: tweet.public_metrics?.reply_count || 0,
        };
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch tweets by hashtag',
      );
    }
  }
}
