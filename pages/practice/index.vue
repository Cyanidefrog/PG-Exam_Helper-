<template>
	<view class="page" v-if="set">
		<!-- 习题集信息 + 进度 -->
		<view class="header">
			<view class="header-top">
				<view class="subject-tag" :style="{ background: tagColor(set.subject) }">{{ set.subject }}</view>
				<view class="header-years">{{ set.startYear }} - {{ set.endYear }} 年</view>
				<view class="header-count">{{ doneCount }}/{{ rows.length }} 已刷</view>
			</view>
			<view class="progress-row">
				<view class="progress-bar">
					<view class="progress-inner" :style="{ width: progress + '%' }"></view>
				</view>
				<view class="progress-text">{{ progress }}%</view>
			</view>
		</view>

		<!-- 每张卷子一张卡片 -->
		<view v-for="row in rows" :key="row.year" class="paper" :class="{ done: row.done }">
			<view class="paper-top">
				<view class="paper-info">
					<view class="paper-year">{{ row.year }} 年</view>
					<view class="paper-time" :class="{ ok: row.done }">{{ row.done ? '已刷 · ' + formatTime(row.doneAt) : '还没刷' }}</view>
				</view>
				<view class="check" :class="{ on: row.done }" hover-class="hover" @click="toggleDone(row)">
					{{ row.done ? '✓' : '' }}
				</view>
			</view>

			<view class="seg">
				<view v-for="type in PASS_TYPES" :key="type" class="seg-item"
					:class="{ on: row.passType === type }" hover-class="hover"
					@click="setType(row, type)">{{ type }}</view>
			</view>
		</view>

		<view class="tip">点「一刷 / 二刷 / 三刷」切换第几轮，点右边圆圈打钩 = 已刷</view>
	</view>
</template>

<script>
	import {
		getSetById,
		getSetYears,
		getRecord,
		upsertRecord,
		PASS_TYPES,
		subjectColor as subjectColorOf
	} from '../../utils/storage.js'

	export default {
		data() {
			return {
				setId: '',
				set: null,
				rows: [],
				PASS_TYPES: PASS_TYPES
			}
		},
		computed: {
			doneCount() {
				return this.rows.filter(row => row.done).length
			},
			progress() {
				return this.rows.length ? Math.round(this.doneCount / this.rows.length * 100) : 0
			}
		},
		onLoad(options) {
			this.setId = options.setId || ''
			const set = getSetById(this.setId)
			if (!set) {
				uni.showToast({ title: '习题集不存在', icon: 'none' })
				setTimeout(() => uni.navigateBack(), 600)
				return
			}
			this.set = set
			const years = getSetYears(set)
			this.rows = years.map(year => {
				const record = getRecord(this.setId, year)
				return {
					year: year,
					passType: record && record.passType ? record.passType : PASS_TYPES[0],
					done: record ? !!record.done : false,
					doneAt: record && record.doneAt ? record.doneAt : 0
				}
			})
			uni.setNavigationBarTitle({ title: set.subject + ' · 刷卷记录' })
		},
		methods: {
			tagColor(subject) {
				return subjectColorOf(subject)
			},
			setType(row, type) {
				row.passType = type
				this.saveRow(row)
			},
			toggleDone(row) {
				row.done = !row.done
				row.doneAt = row.done ? Date.now() : 0
				this.saveRow(row)
			},
			saveRow(row) {
				upsertRecord({
					setId: this.setId,
					year: row.year,
					passType: row.passType,
					done: row.done,
					doneAt: row.doneAt
				})
				uni.showToast({
					title: row.done ? row.year + ' 年已打钩' : '已取消打钩',
					icon: 'none',
					duration: 1000
				})
			},
			formatTime(timestamp) {
				if (!timestamp) return ''
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
		padding: 24rpx 24rpx 80rpx;
		box-sizing: border-box;
	}

	.header {
		background: #fff;
		border-radius: 24rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(31, 36, 48, 0.06);
	}

	.header-top {
		display: flex;
		align-items: center;
	}

	.subject-tag {
		color: #fff;
		font-size: 24rpx;
		padding: 8rpx 22rpx;
		border-radius: 22rpx;
	}

	.header-years {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2430;
		margin-left: 20rpx;
	}

	.header-count {
		margin-left: auto;
		font-size: 24rpx;
		color: #3D6AF2;
		background: #E7EDFF;
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		font-weight: 600;
	}

	.progress-row {
		display: flex;
		align-items: center;
		margin-top: 26rpx;
	}

	.progress-bar {
		flex: 1;
		height: 14rpx;
		background: #F0F2F7;
		border-radius: 10rpx;
		overflow: hidden;
	}

	.progress-inner {
		height: 100%;
		background: linear-gradient(90deg, #5B8CFF, #3D6AF2);
		border-radius: 10rpx;
		transition: width 0.3s;
	}

	.progress-text {
		font-size: 24rpx;
		color: #8A90A0;
		margin-left: 16rpx;
		min-width: 72rpx;
		text-align: right;
	}

	.paper {
		background: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 8rpx 24rpx rgba(31, 36, 48, 0.06);
	}

	.paper.done {
		background: #F4FBF7;
		border: 2rpx solid #C9EBD8;
		box-sizing: border-box;
	}

	.paper-top {
		display: flex;
		align-items: center;
	}

	.paper-info {
		flex: 1;
	}

	.paper-year {
		font-size: 34rpx;
		font-weight: 700;
		color: #1F2430;
	}

	.paper.done .paper-year {
		color: #1E9E58;
	}

	.paper-time {
		font-size: 24rpx;
		color: #A0A6B4;
		margin-top: 8rpx;
	}

	.paper-time.ok {
		color: #1E9E58;
	}

	.check {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		border: 4rpx solid #C6CBD8;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 36rpx;
		font-weight: 700;
		background: #fff;
	}

	.check.on {
		background: #34C77B;
		border-color: #34C77B;
		box-shadow: 0 6rpx 16rpx rgba(52, 199, 123, 0.35);
	}

	.seg {
		display: flex;
		margin-top: 26rpx;
		background: #F0F2F7;
		border-radius: 14rpx;
		padding: 6rpx;
	}

	.seg-item {
		flex: 1;
		text-align: center;
		padding: 16rpx 0;
		font-size: 26rpx;
		color: #4A5162;
		border-radius: 10rpx;
	}

	.seg-item.on {
		background: #fff;
		color: #3D6AF2;
		font-weight: 600;
		box-shadow: 0 4rpx 12rpx rgba(31, 36, 48, 0.1);
	}

	.hover {
		opacity: 0.7;
	}

	.tip {
		text-align: center;
		color: #A0A6B4;
		font-size: 24rpx;
		margin-top: 20rpx;
	}
</style>
