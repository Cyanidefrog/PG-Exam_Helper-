<template>
	<view class="page">
		<!-- 学科筛选 -->
		<view class="filters">
			<view v-for="item in filters" :key="item" class="filter-chip"
				:class="{ active: activeFilter === item }" @click="activeFilter = item">{{ item }}</view>
		</view>

		<view v-if="filteredWrongs.length === 0" class="empty">
			<view class="empty-icon">📖</view>
			<view class="empty-text">{{ activeFilter === '全部' ? '还没有错题，去刷题或点右下角录入吧' : '该学科暂无错题' }}</view>
		</view>

		<view v-for="item in filteredWrongs" :key="item.id" class="wrong-card" @click="goDetail(item.id)">
			<view class="wrong-top">
				<view class="subject-tag" :style="{ background: tagColor(item.subject) }">{{ item.subject }}</view>
				<view class="wrong-meta">{{ item.year }} 年 · 第 {{ item.questionNo }} 题</view>
				<view class="wrong-time">{{ formatTime(item.createdAt) }}</view>
			</view>
			<view class="wrong-note" v-if="item.note">{{ item.note }}</view>
			<view class="wrong-photos" v-if="item.photos && item.photos.length">
				<image v-for="(photo, index) in item.photos" :key="index" class="thumb"
					:src="photo" mode="aspectFill" @click.stop="preview(item.photos, index)" />
			</view>
		</view>

		<view class="fab" @click="goEdit()">＋</view>
	</view>
</template>

<script>
	import {
		getWrongs,
		subjectColor as subjectColorOf,
		previewImages
	} from '../../utils/storage.js'

	export default {
		data() {
			return {
				wrongs: [],
				filters: ['全部'],
				activeFilter: '全部'
			}
		},
		computed: {
			filteredWrongs() {
				if (this.activeFilter === '全部') return this.wrongs
				return this.wrongs.filter(item => item.subject === this.activeFilter)
			}
		},
		onShow() {
			this.reload()
		},
		methods: {
			reload() {
				this.wrongs = getWrongs()
				const subjects = []
				this.wrongs.forEach(item => {
					if (subjects.indexOf(item.subject) < 0) subjects.push(item.subject)
				})
				this.filters = ['全部'].concat(subjects)
				if (this.filters.indexOf(this.activeFilter) < 0) {
					this.activeFilter = '全部'
				}
			},
			tagColor(subject) {
				return subjectColorOf(subject)
			},
			goDetail(id) {
				uni.navigateTo({ url: '/pages/wrong/detail?id=' + id })
			},
			goEdit() {
				uni.navigateTo({ url: '/pages/wrong/edit' })
			},
			preview(urls, index) {
				previewImages(urls, urls[index])
			},
			formatTime(timestamp) {
				const date = new Date(timestamp)
				return (date.getMonth() + 1) + '月' + date.getDate() + '日'
			}
		}
	}
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background: #F5F6FA;
		padding: 24rpx 24rpx 180rpx;
		box-sizing: border-box;
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 24rpx;
	}

	.filter-chip {
		padding: 14rpx 36rpx;
		border-radius: 40rpx;
		background: #fff;
		color: #4A5162;
		font-size: 26rpx;
		margin: 0 16rpx 16rpx 0;
	}

	.filter-chip.active {
		background: #3D6AF2;
		color: #fff;
		font-weight: 600;
	}

	.wrong-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 28rpx;
		margin-bottom: 20rpx;
	}

	.wrong-top {
		display: flex;
		align-items: center;
	}

	.subject-tag {
		color: #fff;
		font-size: 22rpx;
		padding: 6rpx 18rpx;
		border-radius: 20rpx;
	}

	.wrong-meta {
		font-size: 28rpx;
		font-weight: 600;
		color: #1F2430;
		margin-left: 16rpx;
	}

	.wrong-time {
		margin-left: auto;
		font-size: 22rpx;
		color: #A0A6B4;
	}

	.wrong-note {
		margin-top: 16rpx;
		font-size: 26rpx;
		color: #4A5162;
		line-height: 1.6;
	}

	.wrong-photos {
		display: flex;
		margin-top: 16rpx;
	}

	.thumb {
		width: 160rpx;
		height: 160rpx;
		border-radius: 12rpx;
		margin-right: 16rpx;
	}

	.empty {
		text-align: center;
		padding: 160rpx 0;
	}

	.empty-icon {
		font-size: 80rpx;
	}

	.empty-text {
		font-size: 26rpx;
		color: #A0A6B4;
		margin-top: 20rpx;
	}

	.fab {
		position: fixed;
		right: 40rpx;
		bottom: 60rpx;
		width: 110rpx;
		height: 110rpx;
		border-radius: 50%;
		background: #3D6AF2;
		color: #fff;
		font-size: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10rpx 30rpx rgba(61, 106, 242, 0.4);
		z-index: 10;
	}
</style>
