import { view as cevalView } from 'ceval';
import { onClickAway } from 'common';
import { looseH as h, bind, onInsert } from 'common/snabbdom';
import * as licon from 'common/licon';
import AnalyseCtrl from '../../ctrl';
import { view as keyboardView } from '../../keyboard';
import type * as studyDeps from '../../study/studyDeps';
import { tourSide } from '../../study/relay/relayTourView';
import { render as renderTrainingView } from '../../view/roundTraining';
import { renderVideoPlayer, resizeVideoPlayer } from './videoPlayerView';
import {
  type RelayViewContext,
  viewContext,
  renderBoard,
  renderMain,
  renderControls,
  renderTools,
  renderUnderboard,
} from '../../view/components';
import RelayCtrl from './relayCtrl';

export function relayView(
  ctrl: AnalyseCtrl,
  study: studyDeps.StudyCtrl,
  relay: RelayCtrl,
  deps: typeof studyDeps,
) {
  const ctx: RelayViewContext = { ...viewContext(ctrl, deps), study, deps, relay };

  const renderTourView = () => [ctx.tourUi, tourSide(ctrl, study, relay), deps.relayManager(relay, study)];

  return renderMain(ctx, [
    ctrl.keyboardHelp && keyboardView(ctrl),
    deps.studyView.overboard(study),
    ...(ctx.tourUi ? renderTourView() : renderBoardView(ctx)),
  ]);
}

export function init(relay: RelayCtrl) {
  let cols = 0;

  window.addEventListener(
    'resize',
    () => {
      resizeVideoPlayer();
      const newCols = Number(window.getComputedStyle(document.body).getPropertyValue('--cols'));
      if (newCols === cols) return;
      cols = newCols;
      relay.redraw();
    },
    { passive: true },
  );
}

export function renderStreamerMenu(relay: RelayCtrl) {
  return h(
    'div.streamer-menu-anchor',
    h(
      'div.streamer-menu',
      {
        hook: onInsert(
          onClickAway(() => {
            relay.showStreamerMenu(false);
            relay.redraw();
          }),
        ),
      },
      h(
        'div',
        relay.streams.map(([id, name]) =>
          h(
            'button.button-empty.streamer',
            { attrs: { 'data-icon': licon.Mic }, hook: bind('click', () => relay.showStream(id)) },
            name,
          ),
        ),
      ),
    ),
  );
}

function renderBoardView(ctx: RelayViewContext) {
  const { ctrl, deps, study, gaugeOn, relay } = ctx;
  return [
    renderBoard(ctx),
    gaugeOn && cevalView.renderGauge(ctrl),
    renderTools(ctx, renderVideoPlayer(relay)),
    renderControls(ctrl),
    renderUnderboard(ctx),
    tourSide(ctrl, study, relay),
    deps.relayManager(relay, study),
    renderTrainingView(ctrl),
  ];
}
