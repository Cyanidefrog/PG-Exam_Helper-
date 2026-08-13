<template>
	<view class="page">
		<view class="card">
			<view class="label">学科</view>
			<view class="chips">
				<view v-for="item in defaultSubjects" :key="item" class="chip"
					:class="{ active: form.subject === item }" @click="chooseSubject(item)">{{ item }}</view>
				<view class="chip" :class="{ active: isCustom }" @click="chooseSubject('__custom__')">自定义</view>
			</view>
			<input v-if="isCustom" v-model="form.customSubject" class="input" placeholder="输入学科名称" maxlength="10" />
		</view>

		<view class="card">
			<view class="label">年份</view>
			<input class="input" v-model="form.year" type="number" placeholder="如：2024" maxlength="4" />
		</view>

		<view class="card">
			<view class="label">题号</view>
			<input class="input" v-model="form.questionNo" type="number" placeholder="如：12" maxlength="4" />
		</view>

		<view class="card">
			<view class="label">题干 / 备注</view>
			<textarea class="textarea" v-model="form.note" placeholder="记录题目内容、错误原因或解题思路" maxlength="500" />
		</view>

		<view class="card">
			<view class="label">题目照片（最多 3 张，支持拍照）</view>
			<view class="photo-row">
				<view v-for="(photo, index) in form.photos" :key="index" class="photo-item">
					<image class="photo" :src="photo" mode="aspectFill" @click="preview(index)" />
					<view class="photo-del" @click="removePhoto(index)">×</view>
				</view>
				<view v-if="form.photos.length < 3" class="photo-add" @click="addPhoto">＋</view>
			</view>
		</view>

		<view class="save-btn" @click="save">保存错题</view>
		<view class="tip">照片会压缩后保存到本机</view>
	</view>
</template>

<script>
	import {
		DEFAULT_SUBJECTS,
		getWrongById,
		addWrong,
		updateWrong,
		compressImage,
		persistImage,
		removeSavedFile
	} from '../../utils/storage.js'

	export default {
		data() {
			return {
				id: '',
				defaultSubjects: DEFAULT_SUBJECTS,
				form: {
					subject: '英语',
					customSubject: '',
					year: '',
					questionNo: '',
					note: '',
					photos: []
				}
			}
		},
		computed: {
			isCustom() {
				return this.form.subject === '__custom__'
			}
		},
		onLoad(options) {
			if (options.id) {
				this.id = options.id
				const wrong = getWrongById(options.id)
				if (wrong) {
					this.form = {
						subject: wrong.subject,
						customSubject: '',
						year: String(wrong.year),
						questionNo: String(wrong.questionNo),
						note: wrong.note || '',
						photos: wrong.photos || []
					}
					if (DEFAULT_SUBJECTS.indexOf(wrong.subject) < 0) {
						this.form.subject = '__custom__'
						this.form.customSubject = wrong.subject
					}
				}
				uni.setNavigationBarTitle({ title: '编辑错题' })
			}
		},
		methods: {
			chooseSubject(subject) {
				this.form.subject = subject
			},
			addPhoto() {
				const remain = 3 - this.form.photos.length
				uni.chooseImage({
					count: remain,
					sizeType: ['compressed'],
					sourceType: ['camera', 'album'],
					success: async res => {
						uni.showLoading({ title: '保存照片中' })
						try {
							for (const path of res.tempFilePaths) {
								const compressed = await compressImage(path)
								const saved = await persistImage(compressed)
								this.form.photos.push(saved)
							}
						} finally {
							uni.hideLoading()
						}
					}
				})
			},
			removePhoto(index) {
				const removed = this.form.photos.splice(index, 1)[0]
				if (removed) {
					removeSavedFile(removed)
				}
			},
			preview(index) {
				uni.previewImage({ urls: this.form.photos, current: this.form.photos[index] })
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
				const year = this.form.year.trim()
				const questionNo = this.form.questionNo.trim()
				if (!year || !/^\d{4}$/.test(year)) {
					uni.showToast({ title: '请输入正确的年份', icon: 'none' })
					return
				}
				if (!questionNo || !/^\d+$/.test(questionNo)) {
					uni.showToast({ title: '请输入正确的题号', icon: 'none' })
					return
				}
				const data = {
					subject: subject,
					year: Number(year),
					questionNo: Number(questionNo),
					note: this.form.note.trim(),
					photos: this.form.photos
				}
				if (this.id) {
					updateWrong(this.id, data)
				} else {
					addWrong(data)
				}
				uni.showToast({ title: '已保存', icon: 'success' })
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

	.textarea {
		width: 100%;
		height: 220rpx;
		background: #F5F6FA;
		border-radius: 12rpx;
		padding: 20rpx 24rpx;
		font-size: 28rpx;
		box-sizing: border-box;
	}

	.photo-row {
		display: flex;
		flex-wrap: wrap;
	}

	.photo-item {
		position: relative;
		margin: 0 20rpx 20rpx 0;
	}

	.photo {
		width: 200rpx;
		height: 200rpx;
		border-radius: 12rpx;
	}

	.photo-del {
		position: absolute;
		top: -12rpx;
		right: -12rpx;
		width: 44rpx;
		height: 44rpx;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.6);
		color: #fff;
		font-size: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.photo-add {
		width: 200rpx;
		height: 200rpx;
		border-radius: 12rpx;
		border: 2rpx dashed #C6CBD8;
		color: #8A90A0;
		font-size: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
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
