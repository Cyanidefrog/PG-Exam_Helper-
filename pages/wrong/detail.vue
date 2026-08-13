<template>
	<view class="page" v-if="wrong">
		<view class="card">
			<view class="detail-head">
				<view class="subject-tag" :style="{ background: tagColor(wrong.subject) }">{{ wrong.subject }}</view>
				<view class="detail-meta">{{ wrong.year }} 年 · 第 {{ wrong.questionNo }} 题</view>
			</view>
			<view class="detail-time">录入时间：{{ formatTime(wrong.createdAt) }}</view>
			<view class="detail-note" v-if="wrong.note">{{ wrong.note }}</view>
			<view class="detail-note empty" v-else>（没有填写备注）</view>
		</view>

		<view class="card" v-if="wrong.photos && wrong.photos.length">
			<view class="label">题目照片</view>
			<view class="photo-row">
				<image v-for="(photo, index) in wrong.photos" :key="index" class="photo-big"
					:src="photo" mode="aspectFill" @click="preview(index)" />
			</view>
		</view>

		<view class="actions">
			<view class="btn ghost" @click="remove">删除错题</view>
			<view class="btn primary" @click="goEdit">编辑错题</view>
		</view>
	</view>
</template>

<script>
	import {
		getWrongById,
		deleteWrong,
		subjectColor as subjectColorOf
	} from '../../utils/storage.js'

	export default {
		data() {
			return {
				id: '',
				wrong: null
			}
		},
		onLoad(options) {
			this.id = options.id || ''
			this.wrong = getWrongById(this.id)
			if (!this.wrong) {
				uni.showToast({ title: '错题不存在', icon: 'none' })
				setTimeout(() => uni.navigateBack(), 600)
			}
		},
		methods: {
			tagColor(subject) {
				return subjectColorOf(subject)
			},
			preview(index) {
				uni.previewImage({ urls: this.wrong.photos, current: this.wrong.photos[index] })
			},
			goEdit() {
				uni.navigateTo({ url: '/pages/wrong/edit?id=' + this.id })
			},
			remove() {
				uni.showModal({
					title: '删除错题',
					content: '确定删除这道错题吗？',
					confirmText: '删除',
					success: res => {
						if (!res.confirm) return
						deleteWrong(this.id)
						uni.showToast({ title: '已删除', icon: 'success' })
						setTimeout(() => uni.navigateBack(), 600)
					}
				})
			},
			formatTime(timestamp) {
				const d = new Date(timestamp)
				const pad = n => (n < 10 ? '0' + n : '' + n)
				return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
					' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
			}
		}
	}
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background: #F5F6FA;
		padding: 24rpx 24rpx 80rpx;
		box-sizing: border-box;
	}

	.card {
		background: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
	}

	.label {
		font-size: 28rpx;
		color: #1F2430;
		font-weight: 600;
		margin-bottom: 24rpx;
	}

	.detail-head {
		display: flex;
		align-items: center;
	}

	.subject-tag {
		color: #fff;
		font-size: 24rpx;
		padding: 8rpx 22rpx;
		border-radius: 20rpx;
	}

	.detail-meta {
		font-size: 32rpx;
		font-weight: 700;
		color: #1F2430;
		margin-left: 20rpx;
	}

	.detail-time {
		font-size: 24rpx;
		color: #A0A6B4;
		margin-top: 20rpx;
	}

	.detail-note {
		margin-top: 24rpx;
		font-size: 28rpx;
		color: #4A5162;
		line-height: 1.7;
	}

	.detail-note.empty {
		color: #A0A6B4;
	}

	.photo-row {
		display: flex;
		flex-wrap: wrap;
	}

	.photo-big {
		width: 320rpx;
		height: 320rpx;
		border-radius: 12rpx;
		margin: 0 20rpx 20rpx 0;
	}

	.actions {
		display: flex;
		margin-top: 40rpx;
	}

	.btn {
		flex: 1;
		text-align: center;
		padding: 26rpx 0;
		border-radius: 48rpx;
		font-size: 30rpx;
		font-weight: 600;
		margin-right: 20rpx;
	}

	.btn:last-child {
		margin-right: 0;
	}

	.btn.ghost {
		background: #fff;
		color: #FF5B5B;
		border: 2rpx solid #FFD6D6;
	}

	.btn.primary {
		background: #3D6AF2;
		color: #fff;
		box-shadow: 0 10rpx 30rpx rgba(61, 106, 242, 0.3);
	}
</style>
