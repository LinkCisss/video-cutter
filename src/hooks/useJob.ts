import { useRecoilState } from 'recoil';
import jobState from '../store/job.atom';

const useJob = () => {
  const [job, setJob] = useRecoilState(jobState);

  function setFile(file: any) {
    setJob({ ...job, file });
  }

  function setProgress(ratio: number) {
    setJob({ ...job, progress: ratio * 100, active: true, state: 'working' });
  }

  /**
   * 设置裁剪时间
   * 同时预览裁剪后的视频
   * @param start
   * @param end
   */
  function setTime(start: number, end?: number) {
    const newOptions = { ...job.options };

    start = parseFloat(start.toFixed(2));
    newOptions.start = start;

    /**
     *     toFixed == 格式化数据 toFixed(参数) 参数=>保留几位小数，多余的数字，一律四舍五入
     *     round == 四舍五入
     */
    if (end) {
      end = parseFloat(end.toFixed(2));
      newOptions.end = end;
    }

    if (newOptions.start > newOptions.end) {
      newOptions.end = newOptions.start + 1;
    }
    // player.currentTime = value;

    // ensure we cannot go more than the max duration setting
    // if (newSettings.duration > maxDuration) {
    //   // 根据点的移动来确定选择区域
    //   if (pos === 'end') {
    //     newSettings.start = newSettings.end - maxDuration;
    //   }
    //   if (pos === 'start') {
    //     newSettings.end = newSettings.start + maxDuration;
    //   }

    //   newSettings.duration = maxDuration;
    // }

    //返回一个浮点数，精确到两位小数
    newOptions.duration = parseFloat((newOptions.end - newOptions.start).toFixed(2));

    const updatedOptions = { ...job.options, ...newOptions };

    setJob({ ...job, options: updatedOptions });
  }

  return { job, setFile, setProgress, setJob, setTime };
};

export default useJob;
