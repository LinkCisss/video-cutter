import React from 'react';
import Slider from '@material-ui/core/Slider';
import useJob from '../hooks/useJob';
import moment from 'moment';
import '../styles/timeline.scss';
//进度条设置
function Timeline() {
  const { job, setTime } = useJob();

  function handleChange(event: React.ChangeEvent<{}>, value: number | number[]) {
    const options = { ...job.options };
    if (!Array.isArray(value)) {
      return;
    }

    options.end = value[1];
    options.start = value[0];

    setTime(options.start, options.end);
  }

  /**
   * react moment 使用方法：
   * npm install moment
   * import 引入
   */

  /**
   * noteBook -
   * 当前时间：moment().format('YYYY-MM-DD HH:mm:ss');
   * 获取当前时间 : moment()
   * 获取今天0时0分0秒 : moment().startOf('day')
   * 获取今天23时59分59秒 : moment().endOf('day')
   * 获取秒数 : moment().seconds()
   */
  const endLabel = moment().startOf('day').seconds(job.options.max).format('mm:ss');

  return (
    <div className="timeline col">
      <div className="row">
        <Slider
          min={0}
          max={job.options.max}
          value={[job.options.start, job.options.end]}
          onChange={handleChange}
          valueLabelDisplay="auto"
          valueLabelFormat={(val) => {
            return moment().startOf('day').seconds(val).format('mm:ss');
          }}
          step={0.1}
          color={'primary'}
          aria-labelledby="range-slider"
        />
      </div>
      <div className="row">
        <div className="time-label col text-left text-muted">
          <span>00:00</span>
        </div>
        <div className="time-label col text-right text-muted">
          <span>{endLabel}</span>
        </div>
      </div>
    </div>
  );
}

export default Timeline;
