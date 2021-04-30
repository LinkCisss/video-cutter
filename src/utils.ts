import moment from 'moment';

export function validateYouTubeUrl(url: string): boolean {
  if (url !== undefined || url !== '') {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\?v=)([^#&?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length === 11) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}
const serverAddress = process.env.REACT_APP_SERVER_ADDRESS || 'http://localhost:8080';

export function getFileUrlForJob(jobId: string, type: 'video' | 'mp3') {
  let url = serverAddress + '/file/' + jobId;
  if (type === 'mp3') {
    return url + '?format=' + type;
  }
  return url;
}

export function secondsAsString(seconds?: number): string {
  if (!seconds) {
    seconds = 0;
  }

  return moment(seconds, 'ss.SS').format('HH:mm:ss.SS').toString();
}

/**
 * Return the type saved in the localstorage OR video by default
 * 默认情况下
 * 返回 保存在 本地存储 或 视频中 的类型
 */
export function getSavedConvertType(): 'video' | 'mp3' {
  let savedType: any = String(localStorage.getItem('vct_type')) || 'video';

  if (savedType === '') {
    savedType = 'video';
  }
  return savedType;
}

/**
 * Check the duration of the clip and return a
 * @param progress progress ratio (0.0 => 1)
 * @param duration
 * @param fullDuration
 * @return a progress ratio  (0.0 => 1)
 */
/**
 * 检查剪辑的持续时间，然后返回进度进度比（0.0 => 1）
 * @param progress
 * @param duration
 * @param fullDuration
 */
export function getTrueProgress(progress: number, duration: number, fullDuration: number): number {
  // stop if weird or invalid value
  if (progress <= 0) {
    return 0;
  }
  const cutPercent = (duration / fullDuration) * 100;
  const fullProgress = (progress / cutPercent) * 100;
  return fullProgress;
}

export function stringAsSeconds(value: string): number {
  // ensure that the milliseconds are provided
  if (value.indexOf('.') === -1) {
    value = value + '.000';
  }
  return moment.duration(value).asSeconds();
}

//https://www.youtube.com/watch?v=lsoLYWTzqSY 教学视频的网址

export const exampleVideos: {
  title: string;
  url: string;
  thumbnailUrl: string;
}[] = [
  {
    thumbnailUrl: '',
    title: 'Home',
    url: 'https://www.youtube.com/watch?v=lsoLYWTzqSY',
  },
  {
    thumbnailUrl: '',
    title: 'Dj groove',
    url: 'https://www.youtube.com/watch?v=glS_9h80ErE',
  },
  {
    thumbnailUrl: '',
    title: 'Rush hour',
    url: 'https://www.youtube.com/watch?v=JpZca8I2QEQ',
  },
  {
    thumbnailUrl: '',
    title: 'Nyakusa',
    url: 'https://www.youtube.com/watch?v=uOnwmNxjpDQ',
  },
  {
    thumbnailUrl: '',
    title: 'Factorio',
    url: 'https://www.youtube.com/watch?v=pWi2Oevq0LA',
  },
];

export function getLangFlag(lang: string) {
  lang = String(lang.split('-')[0]);
  return './flags/' + lang + '.png';
}
