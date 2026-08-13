<template>
	<view class="page">
		<!-- 统计 -->
		<view class="stats">
			<view class="stat">
				<view class="stat-num">{{ stats.setCount }}</view>
				<view class="stat-label">习题集</view>
			</view>
			<view class="stat">
				<view class="stat-num">{{ stats.doneCount }}</view>
				<view class="stat-label">已刷卷数</view>
			</view>
			<view class="stat">
				<view class="stat-num">{{ stats.wrongCount }}</view>
				<view class="stat-label">错题数</view>
			</view>
		</view>

		<!-- 快捷入口 -->
		<view class="quick">
			<view class="quick-btn create" @click="goCreate">＋ 创建习题集</view>
			<view class="quick-btn wrong" @click="goWrong">📕 错题本</view>
		</view>

		<!-- 习题集列表 -->
		<view class="section-title">我的习题集</view>
		<view v-if="sets.length === 0" class="empty">
			<view class="empty-icon">🗂️</view>
			<view class="empty-text">还没有习题集，点击上方「创建习题集」开始</view>
		</view>

		<view v-for="item in sets" :key="item.id" class="set-card" @click="goPractice(item)">
			<view class="set-top">
				<view class="subject-tag" :style="{ background: tagColor(item.subject) }">{{ item.subject }}</view>
				<view class="set-years">{{ item.startYear }} - {{ item.endYear }} 年</view>
				<view class="set-delete" @click.stop="removeSet(item)">删除</view>
			</view>
			<view class="progress-row">
				<view class="progress-bar">
					<view class="progress-inner" :style="{ width: item.progress + '%' }"></view>
				</view>
				<view class="progress-text">{{ item.doneCount }}/{{ item.yearCount }} 卷 · {{ item.progress }}%</view>
			</view>
			<view class="go-btn" :class="{ all: item.doneCount === item.yearCount }">
				{{ item.doneCount === item.yearCount ? '全部完成 ✓ 去复习' : '去刷卷 ›' }}
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getSets,
		getRecords,
		getWrongs,
		getSetYears,
		deleteSet,
		subjectColor as subjectColorOf
	} from '../../utils/storage.js'

	export default {
		data() {
			return {
				sets: [],
				wrongCount: 0
			}
		},
		computed: {
			stats() {
				const doneCount = this.sets.reduce((sum, item) => sum + item.doneCount, 0)
				return {
					setCount: this.sets.length,
					doneCount: doneCount,
					wrongCount: this.wrongCount
				}
			}
		},
		onShow() {
			this.reload()
		},
		methods: {
			reload() {
				const records = getRecords()
				this.sets = getSets().map(item => {
					const years = getSetYears(item)
					const doneCount = years.filter(year => {
						const record = records.find(r => r.setId === item.id && r.year === year)
						return record && record.done
					}).length
					return Object.assign({}, item, {
						yearCount: years.length,
						doneCount: doneCount,
						progress: years.length ? Math.round(doneCount / years.length * 100) : 0
					})
				})
				this.wrongCount = getWrongs().length
			},
			tagColor(subject) {
				return subjectColorOf(subject)
			},
			goCreate() {
				uni.navigateTo({ url: '/pages/set/create' })
			},
			goWrong() {
				uni.navigateTo({ url: '/pages/wrong/index' })
			},
			goPractice(item) {
				uni.navigateTo({ url: '/pages/practice/index?setId=' + item.id })
			},
			removeSet(item) {
				uni.showModal({
					title: '删除习题集',
					content: '将删除「' + item.subject + ' ' + item.startYear + '-' + item.endYear + '」及其刷卷记录，确定删除吗？',
					confirmText: '删除',
					success: res => {
						if (!res.confirm) return
						deleteSet(item.id)
						this.reload()
						uni.showToast({ title: '已删除', icon: 'success' })
					}
				})
			}
		}
	}
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background: #F5F6FA;
		padding-bottom: 80rpx;
		box-sizing: border-box;
	}

	.stats {
		display: flex;
		padding: 24rpx 24rpx 0;
	}

	.stat {
		flex: 1;
		background: #fff;
		border-radius: 20rpx;
		padding: 30rpx 0;
		text-align: center;
		margin-right: 20rpx;
	}

	.stat:last-child {
		margin-right: 0;
	}

	.stat-num {
		font-size: 44rpx;
		font-weight: 700;
		color: #3D6AF2;
	}

	.stat-label {
		font-size: 24rpx;
		color: #8A90A0;
		margin-top: 8rpx;
	}

	.quick {
		display: flex;
		padding: 24rpx 24rpx 0;
	}

	.quick-btn {
		flex: 1;
		text-align: center;
		padding: 26rpx 0;
		border-radius: 20rpx;
		font-size: 30rpx;
		font-weight: 600;
		margin-right: 20rpx;
	}

	.quick-btn:last-child {
		margin-right: 0;
	}

	.quick-btn.create {
		background: #3D6AF2;
		color: #fff;
		box-shadow: 0 10rpx 30rpx rgba(61, 106, 242, 0.3);
	}

	.quick-btn.wrong {
		background: #fff;
		color: #FF5B5B;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2430;
		margin: 40rpx 24rpx 20rpx;
	}

	.set-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 28rpx;
		margin: 0 24rpx 20rpx;
	}

	.set-top {
		display: flex;
		align-items: center;
	}

	.subject-tag {
		color: #fff;
		font-size: 22rpx;
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
	}

	.set-years {
		font-size: 28rpx;
		font-weight: 700;
		color: #1F2430;
		margin-left: 16rpx;
	}

	.set-delete {
		margin-left: auto;
		font-size: 24rpx;
		color: #A0A6B4;
		padding: 8rpx 12rpx;
	}

	.progress-row {
		display: flex;
		align-items: center;
		margin-top: 20rpx;
	}

	.progress-bar {
		flex: 1;
		height: 16rpx;
		background: #F0F2F7;
		border-radius: 10rpx;
		overflow: hidden;
	}

	.progress-inner {
		height: 100%;
		background: #3D6AF2;
		border-radius: 10rpx;
		transition: width 0.3s;
	}

	.progress-text {
		font-size: 24rpx;
		color: #8A90A0;
		margin-left: 16rpx;
	}

	.go-btn {
		margin-top: 24rpx;
		text-align: center;
		background: #F5F8FF;
		color: #3D6AF2;
		font-size: 28rpx;
		font-weight: 600;
		padding: 20rpx 0;
		border-radius: 40rpx;
	}

	.go-btn.all {
		background: #E8F7EE;
		color: #1E9E58;
	}

	.empty {
		text-align: center;
		padding: 120rpx 0;
	}

	.empty-icon {
		font-size: 80rpx;
	}

	.empty-text {
		font-size: 26rpx;
		color: #A0A6B4;
		margin-top: 20rpx;
	}
</style>


