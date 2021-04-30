import React, {useEffect, useState} from 'react';
import classNames from 'classnames';
import '../styles/video-studio.scss';
import {useTranslation} from 'react-i18next';
import ReactPlayer from 'react-player';
import {IJobState} from '../interfaces/Job.interface';
import {createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg';
import useJob from '../hooks/useJob';
import Timeline from './Timeline';
import {getTrueProgress} from '../utils';

const ffmpeg = createFFmpeg({log: true});
const savedPreviewMode = localStorage.getItem('vct_preview') === 'true' || false;

interface ICanRunJobResult {
  canRun: boolean;
  reason?: string;
}

function VideoStudio() {
  const [t] = useTranslation();
  const [url, setUrl] = useState<string>('');
  // const [loading, setLoading] = useState(true);
  const [playerTime, setPlayerTime] = useState<number>(0);
  const [previewMode, setPreviewMode] = useState<boolean>(savedPreviewMode);
  const [player, setPlayer] = useState<ReactPlayer>();
  const [playerKey, setPlayerKey] = useState(String(Math.random() * 10));

  const {job, setProgress, setJob, setFile, setTime} = useJob();

  useEffect(() => {
    if (!job.file) {
      return;
    }

    //加载文件
    loadFile(job.file);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadFile(file: File) {
    setUrl(URL.createObjectURL(file));
  }

  /**
   * 当用户单击“重新启动”时调用
   */
  function handleRestart() {
    setJob({...job, state: 'idle', active: false, error: false, progress: 0});
  }

  // 选择新文件
  function selectNewFile() {
    handleRestart();
    const dummy = document.getElementById('new-file-dummy');
    dummy?.click();
  }

  // 处理被选择的文件
  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files && files[0]) {
      setFile(files[0]);
      loadFile(files[0]);
    }
  }

  // 预览 change
  function changePreviewMode(active: boolean) {
    localStorage.setItem('vct_preview', String(active));
    setPreviewMode(active);
  }

  /**
   * 可以编辑工作设置
   */
  function canEdit() {
    if (job.state === 'idle') {
      return true;
    }
    return false;
  }

  /**
   * 设置持续时间并应用正确的时间
   * @param duration
   * 下面进度条的时间
   */
  function setDuration(duration: number) {
    duration = parseFloat(duration.toFixed(2));
    if (duration > job.options.duration && job.options.end < job.options.max) {
      // if increment AND can increment
      setTime(job.options.start, job.options.end + 1);
    }
    if (duration < job.options.duration && job.options.end > job.options.min + 1) {
      // if increment AND can increment
      setTime(job.options.start, job.options.end - 1);
    }
  }

  // 处理播放进度
  function handlePlayerProgress(progress: number) {
    setPlayerTime(parseFloat(progress.toFixed(2)));

    //handle preview mode
    if (previewMode) {
      // force the time to be at least at the start
      if (progress < job.options.start) {
        player?.seekTo(job.options.start);
      }
      // ..and not after the end
      if (progress > job.options.end) {
        player?.seekTo(job.options.start);
      }
      // return to start
      if (progress > job.options.end) {
        player?.seekTo(job.options.start);
      }
    }
  }

  //播放完成
  function handlePlayerReady(player: ReactPlayer) {
    const duration = player.getDuration();
    let defaultCut = duration;

    const newOptions = {...job.options};

    newOptions.end = job.options.end || defaultCut;
    newOptions.duration = job.options.duration || defaultCut;
    newOptions.min = job.options.min || 0;
    newOptions.max = duration;

    const updatedOptions = {...job.options, ...newOptions};

    setJob({...job, options: updatedOptions});
  }

  //相当于一个开关 和 判断机制  而且是异步
  async function startJob() {
    if (job.active) {
      return;
    }

    const file = job.file;
    if (!file) {
      return;
    }

    setJob({...job, active: true, progress: 0, state: 'starting'});

    const fn = file.name.split('.');
    const dlFileName = `${fn[0]}-cut`;

    // 输出的文件类型
    let fileOutput = {
      name: `${dlFileName}.mp4`,
      type: 'video/mp4',
    };
    //设定输出文件的Name和类型
    if (job.options.type === 'mp3') {
      fileOutput = {
        name: `${dlFileName}.mp3`,
        type: 'audio/mp3',
      };
    }

    // 视频时长的计算
    const jobDuration = job.options.end - job.options.start;
    //ffmpeg方法
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    ffmpeg.setProgress(({ratio}) => {
      const trueProgress = getTrueProgress(ratio, job.options.duration, job.options.max);
      setProgress(trueProgress);
    });
    //利用ffmpeg写入文件
    ffmpeg.FS('writeFile', 'overlay.png', await fetchFile('overlay.png'));
    ffmpeg.FS('writeFile', file.name, await fetchFile(file));

    /**
     * 调用ffmpeg的控制台的命令：
     * ffmpeg -ss 00:02:00.0 -i input.mkv -t 30 -c copy output.mkv
     * ffmpeg -ss 00:02:00.0 -i input.mkv -t 30 -c copy output.mkv
     * 类似这样 的控制台命令
     */
    await ffmpeg.run(
        '-i',
        file.name,
        '-i',
        'overlay.png',
        '-t',
        String(jobDuration),
        '-ss',
        String(job.options.start),
        '-filter_complex',
        "[0:v][1:v] overlay=10:10:enable='between(t,0,20)'",
        fileOutput.name
    );
    // await ffmpeg.run(
    //     '-i',
    //     'test.mp4',
    //     '-t',
    //     '2.5',
    //     '-ss',
    //     '2.0',
    //     '-f',
    //     'gif',
    //     'out.gif');

    /**
     * 之前的测试代码
     * -i应该是转码命令 avi文件转换为mp4文件
     * 之后读取文件 更改名称
     */
    // await ffmpeg.run('-i', 'test.avi', 'test.mp4');
    // ffmpeg.FS('writeFile', name, await fetchFile(files[0]));
    // await ffmpeg.run('-i', name, 'output.mp4');
    // message.innerHTML = 'Complete transcoding';

    /**
     * 处理视频后 输出文件 这里有点小问题 路径报错
     */
    // const output = ffmpeg.FS('readFile', fileOutput.name);
    // const output = ffmpeg.FS('readFile', 'fileOutput.name');
    // const url = URL.createObjectURL(new Blob([output.buffer], {type: fileOutput.type}));

    setJob({...job, active: false, progress: 100, state: 'done', fileDownloadUrl: url});
    const link = document.createElement('a');

    link.href = url;

    link.download = `${fileOutput.name}`;
    link.click();
  }

  /**
   * 强制刷新
   */
  //重制用户的编号
  function refreshPlayer() {
    const newKey = String(Math.random() * 10);
    setPlayerKey(newKey);
  }

  /**
   * 切换模式时候，调用
   */
  function handleModeChange() {
    const newOptions = {...job.options};
    if (job.options.type === 'mp3') {
      newOptions.type = 'video';
    } else {
      newOptions.type = 'mp3';
    }
    //如果用sessionStorage，可以减少电脑的垃圾。但是每次载入，都会及其的慢，这样会增加浏览器的缓存，但是不会慢，我选了local
    localStorage.setItem('vct_type', newOptions.type);

    setJob({...job, options: newOptions, file: job.file});

    // Force a player refresh after state update
    // 状态更新后强制播放器刷新
    setTimeout(() => {
      refreshPlayer();
    }, 50);
  }

  /**
   * 显示提示
   * @param canRun
   */
  function getTooltipProps(canRun: ICanRunJobResult) {
    if (canRun.reason) {
      return {
        'data-toggle': 'tooltip',
        'data-placement': 'left',
        'data-title': canRun.reason,
      };
    }
    return null;
  }

  /**
   * 如果视频较长，显示警告，设置为true
   */
  function shouldShowDurationWarning() {
    if (job.state === 'idle' && job.options.max > 120) {
      return true;
    }
    return false;
  }

  /**
   * 告诉用户 ， 是否可以开始工作
   * job.state
   */
  function canRunJob(): ICanRunJobResult {
    if (job.state === 'idle') {
      return {
        canRun: true,
      };
    }

    if (job.state === 'error') {
      return {
        canRun: true,
      };
    }

    return {
      canRun: false,
    };
  }
  //获取按钮的标签,状态 ，就是：让他知道 我点了什么按钮
  function getButtonLabel(job: IJobState) {
    switch (job.state) {
      case 'idle':
        return t('studio.cutAndDownload');
      case 'error':
        return t('commons.retry');
      default:
        return t('state.' + job.state);
    }
  }
  //js中写HTML代码，react特性
  //class的名字必须这样写，这是内置的类，不写这样的名字，就要全部自己手写一份，然而这是重复发明轮子，会造成极大的性能损失，和代码拢余
  //如果全部处理完，就返回html代码，这样的好处是，不需要进行监听，直接按顺序执行就🆗
  return (
      <div className="video-studio container mt-0 mt-sm-20">
        <div className="row">
          <div className="col-lg-6">
            <h2>{t('studio.cutTitle')}</h2>
            <ReactPlayer
                config={{
                  file: {
                    forceVideo: job.options.type !== 'mp3',
                    forceAudio: job.options.type === 'mp3',
                  },
                }}
                url={url}
                key={playerKey}
                ref={(player) => setPlayer(player!)}
                volume={0.5}
                controls={true}
                width={'100%'}
                progressInterval={100}
                onReady={handlePlayerReady}
                onProgress={(state) => {
                  handlePlayerProgress(state.playedSeconds);
                }}
            />
          </div>
          <div className="col-lg-6">
            <div className="card">
              <h2 className="card-title">{t('studio.cutSettings')}</h2>
              <div className="row">
                <div className="form-group col-4">
                  <label>{t('studio.currentTime')}</label>
                  <input type="number" step="0.1" value={playerTime} min={0} className="form-control" disabled/>
                </div>
                <div className="col-4 d-flex align-items-center justify-content-center">
                  <div className="custom-switch" data-toggle="tooltip" data-title={t('studio.previewModeDesc')}>
                    <input
                        type="checkbox"
                        id="switch-preview"
                        checked={previewMode}
                        disabled={!canEdit()}
                        onChange={() => changePreviewMode(!previewMode)}
                    />
                    <label htmlFor="switch-preview">{t('studio.previewMode')}</label>
                  </div>
                </div>

                <div className="col-4 d-flex align-items-center justify-content-center">
                  <div className="custom-switch" data-toggle="tooltip" data-placement="right"
                       data-title={t('studio.downloadMp3')}>
                    <input
                        type="checkbox"
                        id="switch-mode"
                        disabled={!canEdit()}
                        checked={job.options.type === 'mp3'}
                        onChange={() => {
                          handleModeChange();
                        }}
                    />
                    <label htmlFor="switch-mode">
                      <i className="fas fa-music"></i>
                    </label>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="input-group col">
                  <div className="input-group-prepend">
                    <button
                        className="btn tool-btn"
                        disabled={!canEdit()}
                        onClick={() => {
                          setTime(playerTime);
                        }}
                    >
                      {t('studio.start')}
                    </button>
                  </div>
                  <input
                      type="number"
                      disabled={!canEdit()}
                      value={job.options.start}
                      min={job.options.min}
                      step="0.1"
                      max={job.options.end}
                      className="form-control"
                      onChange={(e) => {
                        setTime(parseFloat(e.target.value));
                      }}
                  />
                </div>
                <div className="input-group col">
                  <div className="input-group-prepend">
                    <button
                        disabled={!canEdit()}
                        className="btn tool-btn"
                        onClick={() => {
                          setTime(job.options.start, playerTime);
                        }}
                    >
                      {t('studio.end')}
                    </button>
                  </div>
                  <input
                      type="number"
                      disabled={!canEdit()}
                      value={job.options.end}
                      min={job.options.start}
                      max={job.options.max}
                      step="0.1"
                      className="form-control"
                      onChange={(e) => {
                        setTime(job.options.start, parseFloat(e.target.value));
                      }}
                  />
                </div>
              </div>
              <div className="row">
                <div className="input-group col-6">
                  <div className="input-group-prepend text-center">
                    <button disabled={!canEdit()} className="btn tool-btn">
                      {t('studio.duration')}
                    </button>
                  </div>
                  <input
                      type="number"
                      disabled={!canEdit()}
                      value={job.options.duration}
                      min="0"
                      step="0.1"
                      className="form-control"
                      onChange={(e) => {
                        setDuration(parseFloat(e.target.value));
                      }}
                  />
                </div>
              </div>
              <div className="row">
                <Timeline/>
              </div>
              <hr></hr>

              <>
                {job.state !== 'done' && (
                    <>
                      {/* // BASE BTN */}
                      <button
                          {...getTooltipProps(canRunJob())}
                          className={classNames('btn btn-primary btn-lg btn-block mb-5')}
                          disabled={!canRunJob().canRun}
                          type="button"
                          onClick={() => startJob()}
                      >
                        <span>{getButtonLabel(job)}</span>
                      </button>
                    </>
                )}
                {job.state === 'done' && (
                    //DONE BTN
                    <>
                      <a href={job.fileDownloadUrl} className={classNames('btn btn-success btn-lg btn-block mb-5')}
                         download>
                    <span>
                      {t('studio.download')} <i className="fa fa-cloud-download-alt "></i>
                    </span>
                      </a>
                    </>
                )}

                {shouldShowDurationWarning() && (
                    <div className="row">
                      <div className="col">
                        <div className="alert alert-secondary" role="alert">
                          <i className="fas fa-exclamation-triangle"></i> {t('studio.longVideoWarning')}
                        </div>
                      </div>
                    </div>
                )}

                <div className={classNames('progress-group work-progress', {active: job.state !== 'idle'})}>
                  <div className="progress">
                    <div
                        className={classNames('progress-bar progress-bar-animated', {
                          'bg-success': job.state === 'done',
                          'bg-danger': job.state === 'error',
                        })}
                        role="progressbar"
                        style={{
                          width: `${job.progress}%`,
                        }}
                        aria-valuenow={job.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    ></div>
                  </div>
                  <span className="progress-group-label">
                  {job.state === 'done' && <i className="fa fa-check-circle text-success font-size-16"></i>}
                    {(job.state === 'starting' || job.state === 'working') &&
                    <i className="fa fa-circle-notch text-primary font-size-16 rotating"></i>}

                    {job.state === 'error' && (
                        <span data-toggle="tooltip" data-title={t('studio.anErrorHappened')}>
                      <i className="fa fa-exclamation-circle text-danger font-size-16"></i>
                    </span>
                    )}
                </span>
                </div>

                <div className="text-right">
                  <button className="btn btn-link" onClick={selectNewFile}>
                    {t('studio.anotherVideo')}
                  </button>
                  {job.state === 'done' && (
                      <>
                        {'   '}
                        {t('commons.or')}
                        <button className="btn btn-link" onClick={() => handleRestart()}>
                          {t('commons.restart')}
                        </button>
                      </>
                  )}
                </div>
              </>

              <input
                  type="file"
                  id="new-file-dummy"
                  accept="video/mp4,video/x-m4v,video/*"
                  style={{display: 'none'}}
                  onChange={(e) => {
                    handleFileSelected(e);
                  }}
              />

              {/* <div className="row debug-info">
              <code>{JSON.stringify(job)}</code>
            </div> */}
            </div>
          </div>
        </div>
      </div>
  );
}

export default VideoStudio;
