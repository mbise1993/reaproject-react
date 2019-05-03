import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import TestPanel from '../test/TestPanel';
import PageHeader from './PageHeader';

storiesOf('HeaderPanel', module).add('No user logged in', () => {
  return (
    <TestPanel width="100%" height="60px">
      <PageHeader
        id="header-panel"
        user={undefined}
        canRunTransform={true}
        isTransformRunning={false}
        onRunTransformClick={action('run transform clicked')}
        onShowTransformsClick={action('show transforms clicked')}
      />
    </TestPanel>
  );
});

storiesOf('HeaderPanel', module).add('User logged in', () => {
  const user = {
    id: '1',
    username: 'user1',
  };

  return (
    <TestPanel width="100%" height="60px">
      <PageHeader
        id="header-panel"
        user={user}
        canRunTransform={false}
        isTransformRunning={false}
        onRunTransformClick={action('run transform clicked')}
        onShowTransformsClick={action('show transforms clicked')}
      />
    </TestPanel>
  );
});

storiesOf('HeaderPanel', module).add('Transform running', () => {
  return (
    <TestPanel width="100%" height="60px">
      <PageHeader
        id="header-panel"
        user={undefined}
        canRunTransform={true}
        isTransformRunning={true}
        onRunTransformClick={action('run transform clicked')}
        onShowTransformsClick={action('show transforms clicked')}
      />
    </TestPanel>
  );
});
