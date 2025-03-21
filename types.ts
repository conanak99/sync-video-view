export interface YouTubeLiveBroadcastListResponse {
	kind: string;
	etag: string;
	nextPageToken?: string;
	pageInfo: {
		totalResults: number;
		resultsPerPage: number;
	};
	items: YouTubeLiveBroadcast[];
}

export interface YouTubeLiveBroadcast {
	kind: string;
	etag: string;
	id: string;
	snippet: {
		publishedAt: string;
		channelId: string;
		title: string;
		description: string;
		thumbnails: {
			default?: ThumbnailDetails;
			medium?: ThumbnailDetails;
			high?: ThumbnailDetails;
			standard?: ThumbnailDetails;
			maxres?: ThumbnailDetails;
		};
		actualStartTime?: string;
		actualEndTime?: string;
		isDefaultBroadcast: boolean;
		liveChatId?: string;
	};
	status: {
		lifeCycleStatus: 'created' | 'ready' | 'testing' | 'live' | 'complete' | 'revoked';
		privacyStatus: 'public' | 'private' | 'unlisted';
		recordingStatus: 'notRecording' | 'recording' | 'recorded';
		madeForKids: boolean;
		selfDeclaredMadeForKids: boolean;
	};
	contentDetails: {
		boundStreamId?: string;
		boundStreamLastUpdateTimeMs?: string;
		monitorStream?: {
			enableMonitorStream: boolean;
			broadcastStreamDelayMs: number;
			embedHtml?: string;
		};
		enableEmbed: boolean;
		enableDvr: boolean;
		enableContentEncryption: boolean;
		recordFromStart: boolean;
		enableClosedCaptions: boolean;
		closedCaptionsType: string;
		enableLowLatency: boolean;
		latencyPreference: 'normal' | 'low' | 'ultraLow';
		projection: 'rectangular' | '360';
		enableAutoStart: boolean;
		enableAutoStop: boolean;
	};
	statistics: {
		concurrentViewers?: string;
	};
	monetizationDetails: Record<string, any>;
}

export interface ThumbnailDetails {
	url: string;
	width: number;
	height: number;
}
