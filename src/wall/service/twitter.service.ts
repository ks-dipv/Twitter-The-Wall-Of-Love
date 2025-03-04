import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TwitterService {
    async fetchTweetDetails(tweetUrl: string): Promise<any> {
        // Ensure tweetUrl is a valid string before proceeding
        if (!tweetUrl || typeof tweetUrl !== 'string') {
            console.log('tweetUrl is invalid:', tweetUrl, typeof tweetUrl);
            throw new BadRequestException('Invalid tweet URL provided');
        }
        

        // Extract tweet ID using regex
        const match = tweetUrl.match(/status\/(\d+)/);
        if (!match || !match[1]) {
            throw new BadRequestException('Invalid tweet URL format');
        }

        const tweetId = match[1];

        try {
            // Fetch tweet details from Twitter API
            const response = await axios.get(`https://api.twitter.com/2/tweets/${tweetId}`, {
                headers: {
                    Authorization: `Bearer AAAAAAAAAAAAAAAAAAAAAC5bzgEAAAAAKROdudNSzHvZlhY%2BdBvL76rVnl8%3DW5CqtD13jRfKwQo2gdhcC2OEKCMNeuOcw5qh9qNFbkj64Hpgy4`,
                },
                params: {
                    "tweet.fields": "created_at,public_metrics",
                    "expansions": "author_id",
                    "user.fields": "name,profile_image_url",
                }
            });

            if (!response.data || !response.data.data) {
                throw new BadRequestException('Failed to retrieve tweet details');
            }

            const tweetData = response.data.data;
            const userData = response.data.includes?.users?.[0];

            return {
                tweet_url: tweetUrl,
                content: tweetData.text,
                author_name: userData?.name || 'Unknown',
                author_profile_image: userData?.profile_image_url || null,
                author_profile_link: userData ? `https://twitter.com/${userData.username}` : null,
                likes: tweetData.public_metrics.like_count || 0,
                comments: tweetData.public_metrics.reply_count || 0,
            };
        } catch (error) {
            console.error('Error fetching tweet details:', error);
            throw new BadRequestException(`Failed to fetch tweet details: ${error.message}`);
        }
    }
}
