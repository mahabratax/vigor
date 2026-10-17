import { displayLabel } from '../../i18n/display';
import React, { useState } from 'react';
import { Button, Empty, Icon, Modal, Tabs } from '../../components/ui';
import { clockTime, dateLabel } from '../../domain/format';
import type { NotificationItem } from './notifications';
export function NotificationCenter({
  items,
  readIds,
  greenhouseName,
  onRead,
  onNavigate,
  onClose,
}: {
  items: NotificationItem[];
  readIds: string[];
  greenhouseName: string;
  onRead: (ids: string[]) => void;
  onNavigate: (url: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState('all');
  const unread = items.filter((n) => !readIds.includes(n.id));
  const rows = tab === 'unread' ? unread : items;
  return (
    <Modal drawer title={'Notifications'} description={greenhouseName} onClose={onClose}>
      <div className="notification-center">
        <div className="notification-toolbar">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { id: 'all', label: 'All', count: items.length },
              { id: 'unread', label: 'Unread', count: unread.length },
            ]}
          />
          <Button
            small
            tone="ghost"
            disabled={!unread.length}
            onClick={() => onRead(unread.map((n) => n.id))}
          >
            Mark all as read
          </Button>
        </div>
        <div className="notification-list">
          {rows.map((n) => {
            const read = readIds.includes(n.id);
            return (
              <article key={n.id} className={`notification-item ${read ? 'read' : 'unread'}`}>
                <span className={`notification-symbol ${n.tone}`}>
                  <Icon
                    name={
                      n.kind === 'inspection'
                        ? 'bug'
                        : n.kind === 'device'
                          ? 'devices'
                          : n.kind === 'automation'
                            ? 'workflow'
                            : 'wallet'
                    }
                  />
                </span>
                <div>
                  <button
                    className="notification-target"
                    onClick={() => {
                      onRead([n.id]);
                      onNavigate(n.url);
                      onClose();
                    }}
                  >
                    <strong>{displayLabel(n.title)}</strong>
                    <p>{displayLabel(n.detail)}</p>
                  </button>
                  <div className="notification-meta">
                    <time>
                      {displayLabel(dateLabel(n.at))}, {displayLabel(clockTime(n.at))} WIB
                    </time>
                    {!read && (
                      <button
                        onClick={() => onRead([n.id])}
                        aria-label={`Mark as read: ${n.title}`}
                      >
                        Mark as read
                      </button>
                    )}
                    {read && <span>Read</span>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!rows.length && (
          <Empty
            icon="bell"
            title={tab === 'unread' ? 'All notifications read' : 'No notifications yet'}
            detail={
              "Notifications follow this greenhouse's activity. Choose notification types in Settings."
            }
          />
        )}
        <div className="notification-footer">
          <p>Local browser notifications; no push or email delivery.</p>
          <Button
            small
            onClick={() => {
              onNavigate('/settings?tab=notifications');
              onClose();
            }}
          >
            Notification settings
          </Button>
        </div>
      </div>
    </Modal>
  );
}
