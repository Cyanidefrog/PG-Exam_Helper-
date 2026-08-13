<template>
	<view class="page">
		<view class="card">
			<view class="label">选择学科</view>
			<view class="chips">
				<view v-for="item in defaultSubjects" :key="item"
					class="chip" :class="{ active: form.subject === item }"
					@click="chooseSubject(item)">{{ item }}</view>
				<view class="chip" :class="{ active: isCustom }" @click="chooseSubject('__custom__')">自定义</view>
			</view>
			<input v-if="isCustom" v-model="form.customSubject" class="input"
				placeholder="输入学科名称，如：专业课" maxlength="10" />
		</view>

		<view class="card">
			<view class="label">卷子年份范围</view>
			<view class="year-row">
				<picker mode="selector" :range="yearOptions" :value="startIndex" @change="onStartYearChange">
					<view class="picker">{{ form.startYear }} 年</view>
				</picker>
				<text class="sep">至</text>
				<picker mode="selector" :range="yearOptions" :value="endIndex" @change="onEndYearChange">
					<view class="picker">{{ form.endYear }} 年</view>
				</picker>
			</view>
			<view class="desc">创建后，范围内每一年就是一张卷子，在「刷卷记录」里打钩</view>
		</view>

		<view class="save-btn" @click="save">创建习题集</view>
		<view class="tip">所有数据仅保存在本机，不依赖网络</view>
	</view>
</template>

<script>
	import { DEFAULT_SUBJECTS, createSet } from '../../utils/storage.js'

	export default {
		data() {
			const currentYear = new Date().getFullYear()
			const yearOptions = []
			for (let year = 1990; year <= currentYear; year++) {
				yearOptions.push(year + ' 年')
			}
			return {
				defaultSubjects: DEFAULT_SUBJECTS,
				yearOptions: yearOptions,
				form: {
					subject: '英语',
					customSubject: '',
					startYear: currentYear - 1,
					endYear: currentYear
				}
			}
		},
		computed: {
			isCustom() {
				return this.form.subject === '__custom__'
			},
			startIndex() {
				const index = this.yearOptions.indexOf(this.form.startYear + ' 年')
				return index >= 0 ? index : 0
			},
			endIndex() {
				const index = this.yearOptions.indexOf(this.form.endYear + ' 年')
				return index >= 0 ? index : this.yearOptions.length - 1
			}
		},
		methods: {
			chooseSubject(subject) {
				this.form.subject = subject
			},
			onStartYearChange(event) {
				this.form.startYear = 1990 + Number(event.detail.value)
			},
			onEndYearChange(event) {
				this.form.endYear = 1990 + Number(event.detail.value)
			},
			save() {
				let subject = this.form.subject
				if (this.isCustom) {
					subject = (this.form.customSubject || '').trim()
					if (!subject) {
						uni.showToast({ title: '请输入自定义学科名称', icon: 'none' })
						return
					}
				}
				if (this.form.startYear > this.form.endYear) {
					uni.showToast({ title: '开始年份不能晚于结束年份', icon: 'none' })
					return
				}
				createSet({
					subject: subject,
					startYear: this.form.startYear,
					endYear: this.form.endYear
				})
				uni.showToast({ title: '创建成功', icon: 'success' })
				setTimeout(() => uni.navigateBack(), 600)
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

	.chips {
		display: flex;
		flex-wrap: wrap;
	}

	.chip {
		padding: 14rpx 40rpx;
		border-radius: 40rpx;
		background: #F0F2F7;
		color: #4A5162;
		font-size: 28rpx;
		margin: 0 20rpx 20rpx 0;
	}

	.chip.active {
		background: #E7EDFF;
		color: #3D6AF2;
		font-weight: 600;
	}

	.input {
		margin-top: 24rpx;
		background: #F5F6FA;
		border-radius: 12rpx;
		padding: 20rpx 24rpx;
		font-size: 28rpx;
	}

	.year-row {
		display: flex;
		align-items: center;
	}

	.picker {
		flex: 1;
		text-align: center;
		background: #F5F6FA;
		border-radius: 12rpx;
		padding: 20rpx 0;
		font-size: 30rpx;
		color: #1F2430;
	}

	.sep {
		margin: 0 30rpx;
		color: #8A90A0;
	}

	.desc {
		margin-top: 20rpx;
		font-size: 24rpx;
		color: #A0A6B4;
		line-height: 1.6;
	}

	.save-btn {
		margin: 40rpx 0 20rpx;
		background: #3D6AF2;
		color: #fff;
		font-size: 32rpx;
		font-weight: 600;
		text-align: center;
		padding: 28rpx 0;
		border-radius: 48rpx;
		box-shadow: 0 10rpx 30rpx rgba(61, 106, 242, 0.3);
	}

	.tip {
		text-align: center;
		color: #A0A6B4;
		font-size: 24rpx;
	}
</style>
