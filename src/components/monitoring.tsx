import { displayLabel } from '../i18n/display';
import React from 'react';
import { assets } from '../data/assets';
import { clockTime, dateLabel, number } from '../domain/format';
import { availableDevices, sensorValue } from '../domain/scheduler';
import { assessStoredReading, SENSOR_METRICS } from '../domain/telemetry';
import type { Device, DomainState } from '../domain/types';
import { Badge, Button, Empty, Icon, SourceTag } from './ui';
import { FarmObject } from './FarmObject';
import { deviceArtwork } from '../data/farmObjects';
export class CameraPreview extends React.Component<
  {
    s: DomainState;
    deviceId?: string;
    compact?: boolean;
    onDetails?: () => void;
  },
  {
    videoError: boolean;
  }
> {
  state = { videoError: false };
  private container = React.createRef<HTMLDivElement>();
  private video = React.createRef<HTMLVideoElement>();
  private observer: IntersectionObserver | null = null;
  private visibility = () => {
    if (document.hidden) this.video.current?.pause();
  };
  componentDidMount() {
    document.addEventListener('visibilitychange', this.visibility);
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver((entries) => {
        if (!entries[0]?.isIntersecting) this.video.current?.pause();
      });
      if (this.container.current) this.observer.observe(this.container.current);
    }
  }
  componentWillUnmount() {
    document.removeEventListener('visibilitychange', this.visibility);
    this.observer?.disconnect();
  }
  render() {
    const { s, compact = false } = this.props;
    const d = s.devices.find((d) => d.id === (this.props.deviceId ?? 'CAM-B-02'));
    if (!d)
      return (
        <Empty
          icon="camera"
          title={'No camera registered'}
          detail={'Add a camera in Devices to set up monitoring for this zone.'}
        />
      );
    const online = d?.connection === 'online',
      trap = d?.id === 'CAM-B-02';
    const video = assets.cameraVideo;
    const image = trap ? assets.camera : assets.greenhouseReference;
    return (
      <div className={`camera-preview ${compact ? 'compact' : ''}`} ref={this.container}>
        <div className="camera-media">
          {video && !this.state.videoError && online ? (
            <video
              ref={this.video}
              src={video}
              poster={image}
              muted
              playsInline
              controls
              preload="metadata"
              onError={() => this.setState({ videoError: true })}
            />
          ) : (
            <img
              src={image}
              alt={
                trap
                  ? 'Trap reference image; not a recording from a connected device.'
                  : 'Area reference image. Camera video is not available yet.'
              }
              loading="lazy"
            />
          )}
          <span className="camera-overlay-top">
            <span>
              <Icon name="camera" size={14} />
              {displayLabel(d?.label ?? 'Sample camera')}
            </span>
            <Badge tone={online ? 'green' : 'gray'} dot>
              {displayLabel(online ? 'Reference image' : 'Offline')}
            </Badge>
          </span>
          <div className="camera-overlay-bottom">
            <span>
              {displayLabel(
                online
                  ? 'Sample image'
                  : `Last recording ${d ? clockTime(d.lastSeen) : '08:10'} WIB`,
              )}
            </span>
            <button
              aria-label={'View full-screen image'}
              onClick={() => {
                const el = this.container.current;
                if (el?.requestFullscreen)
                  void el.requestFullscreen().catch(() => this.props.onDetails?.());
                else this.props.onDetails?.();
              }}
            >
              <Icon name="fullscreen" size={17} />
            </button>
          </div>
        </div>
        {!compact && (
          <>
            <div className="camera-caption">
              <span>
                <strong>{displayLabel(trap ? 'Trap camera' : 'Area camera')}</strong>
                <small>
                  Zone {displayLabel(d?.zones.join(', '))},{' '}
                  {displayLabel(d ? dateLabel(d.lastSeen) : '13 Oct 2026')},{' '}
                  {displayLabel(d ? clockTime(d.lastSeen) : '09:42')} WIB
                </small>
              </span>
              <SourceTag>{displayLabel(video ? 'Sample video' : 'Reference image')}</SourceTag>
            </div>
            <p className="micro muted">Reference image. Monitoring video is not connected.</p>
            <div className="button-row">
              <Button
                small
                icon="camera"
                disabled
                title={'Snapshots will be available once monitoring video is connected.'}
              >
                Take snapshot
              </Button>
              {this.props.onDetails && (
                <Button small icon="external" onClick={this.props.onDetails}>
                  Device details
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
}
export function SensorCard({
  s,
  id,
  humidity = false,
  compact = false,
}: {
  s: DomainState;
  id: string;
  humidity?: boolean;
  compact?: boolean;
}) {
  const d = availableDevices(s).find((d) => d.id === id);
  const val = sensorValue(s, id, humidity ? 'humidity' : undefined);
  const metric = humidity
    ? 'humidity'
    : SENSOR_METRICS.find((m) => m !== 'humidity' && d?.capabilities.includes(m));
  const assessment = s.readings && metric ? assessStoredReading(s, id, metric) : null;
  const qualityLabels = {
    ready: 'Stored reading',
    missing: 'No reading',
    offline: 'Offline',
    stale: 'Reading expired',
    uncalibrated: 'Not calibrated',
    maintenance: 'Under maintenance',
    invalid: 'Invalid reading',
    future: 'Timestamp is in the future',
    unsupported: 'Unsupported measurement',
  };
  const capturedAt = assessment?.reading?.capturedAt;
  const hasTimestamp = capturedAt && Number.isFinite(Date.parse(capturedAt));
  const thermal = d?.capabilities.includes('temperature') || id.startsWith('TH-');
  const kind = thermal
    ? humidity
      ? 'Air humidity'
      : 'Air temperature'
    : id.startsWith('MEDIA')
      ? 'Growing media moisture'
      : id === 'FLOW-01'
        ? 'Flow rate'
        : id === 'EC-01'
          ? 'Solution EC'
          : id === 'PH-01'
            ? 'Solution pH'
            : 'Tank level';
  const unit = thermal
    ? humidity
      ? '% RH'
      : '°C'
    : id === 'EC-01'
      ? 'mS/cm'
      : id === 'PH-01'
        ? ''
        : id === 'FLOW-01'
          ? 'L/min'
          : id.startsWith('MEDIA')
            ? 'index'
            : '%';
  const icon = thermal && !humidity ? 'temp' : id === 'EC-01' || id === 'PH-01' ? 'flask' : 'drop';
  return (
    <div className={`sensor-card ${compact ? 'compact' : ''}`}>
      <div className="sensor-top">
        <span className="soft-icon">
          <Icon name={icon} />
        </span>
        <div>
          <span>{displayLabel(kind)}</span>
          <strong>
            {displayLabel(val === null ? '—' : number(val, 1))}{' '}
            <small>{displayLabel(val === null ? '' : unit)}</small>
          </strong>
        </div>
      </div>
      {d ? (
        <>
          <div className="sensor-foot">
            <span className={val === null ? 'amber-text' : 'muted'}>
              {assessment
                ? hasTimestamp
                  ? `${dateLabel(capturedAt)} ${clockTime(capturedAt)} WIB`
                  : 'No timestamp'
                : d.connection === 'online'
                  ? `${clockTime(s.clock)} WIB`
                  : 'Offline'}
            </span>
            <span>
              {assessment
                ? qualityLabels[assessment.quality]
                : val !== null
                  ? 'Sample data'
                  : d.calibrated
                    ? 'No reading'
                    : 'Not calibrated'}
            </span>
          </div>
          {!compact && (
            <div className="sensor-provenance">
              {displayLabel(
                val === null
                  ? s.greenhouse.source === 'custom'
                    ? 'No sensor readings are available for this greenhouse.'
                    : 'Check the sensor connection and calibration.'
                  : assessment
                    ? `Source: ${assessment.reading?.provenance ?? 'unknown'}. Latest recorded value; no live feed connected.`
                    : 'Sample value, not a reading history.',
              )}
            </div>
          )}
        </>
      ) : (
        <p className="micro muted">Not installed</p>
      )}
    </div>
  );
}
export function DeviceSymbol({ device }: { device: Device }) {
  return (
    <span className="device-symbol">
      <FarmObject name={deviceArtwork(device)} />
    </span>
  );
}
