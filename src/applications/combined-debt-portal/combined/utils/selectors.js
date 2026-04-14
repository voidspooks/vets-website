import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { useParams } from 'react-router-dom';
import { groupBy, orderBy } from 'lodash';
import {
  getCopaySummaryStatements,
  getCopayDetailStatement,
} from '../actions/copays';
import { selectUseLighthouseCopays } from './helpers';
import { groupCopaysByMonth } from './vbsCopayStatements';

export const selectCopayDetail = state =>
  state.combinedPortal.mcp.selectedStatement || {};

export const selectAllCopays = state =>
  state.combinedPortal.mcp.statements?.data;

export const selectIsCopayDetailLoading = state =>
  state.combinedPortal.mcp.isCopayDetailLoading;

export const selectMcpStatementsLoaded = state =>
  !!state.combinedPortal.mcp.statements;

export const selectMcpStatementsPending = state =>
  state.combinedPortal.mcp.pending;

export const selectCurrentStatementMcpState = state => ({
  shouldUseLighthouseCopays: selectUseLighthouseCopays(state),
  copayDetail: selectCopayDetail(state),
  isCopayDetailLoading: selectIsCopayDetailLoading(state),
  statementsLoaded: selectMcpStatementsLoaded(state),
  statementsPending: selectMcpStatementsPending(state),
});

const findCopayById = (copays, id) => copays?.find(copay => copay.id === id);

export const selectVbsGroupedCopaysByMonth = createSelector(
  selectAllCopays,
  (_state, currentCopayId) => currentCopayId,
  (allCopays, currentCopayId) => {
    if (currentCopayId == null) return [];
    const currentCopay = findCopayById(allCopays, currentCopayId);
    if (!currentCopay) return [];
    return groupCopaysByMonth(
      allCopays,
      currentCopay.pSFacilityNum,
      currentCopay.id,
    );
  },
);

export const useVbsGroupedCopaysByCurrentCopay = (
  currentCopayId,
  shouldUseLighthouseCopays,
) => {
  const id = shouldUseLighthouseCopays === true ? null : currentCopayId;
  return useSelector(state => selectVbsGroupedCopaysByMonth(state, id));
};

export const selectVbsStatementGroup = createSelector(
  (state, currentCopayId, _statementId) =>
    selectVbsGroupedCopaysByMonth(state, currentCopayId),
  (_state, _currentCopayId, statementId) => statementId,
  (grouped, statementId) => {
    if (statementId == null) return undefined;
    return grouped.find(group => group.compositeId === statementId);
  },
);

export const useVbsCurrentStatement = () => {
  const dispatch = useDispatch();
  const { parentCopayId, statementId } = useParams();

  const statementsLoaded = useSelector(selectMcpStatementsLoaded);
  const statementsPending = useSelector(selectMcpStatementsPending);

  const groupedCopaysByMonth = useVbsGroupedCopaysByCurrentCopay(
    parentCopayId,
    false,
  );

  const monthlyStatement = useSelector(state =>
    selectVbsStatementGroup(state, parentCopayId, statementId),
  );

  if (!statementsPending && !statementsLoaded) {
    dispatch(getCopaySummaryStatements());
  }

  return {
    monthlyStatement,
    isLoading: statementsPending,
    groupedCopaysByMonth,
  };
};

export const groupVbsCopaysByStatements = grouped =>
  grouped.flatMap(group =>
    group.copays.map(copay => ({
      id: copay.id,
      pSStatementDateOutput: copay.pSStatementDateOutput,
    })),
  );

const sortCopaysByDateDesc = copays =>
  orderBy(copays, c => new Date(c.date), 'desc');

const sortGroupsByDateDesc = groups =>
  orderBy(groups, g => new Date(g.copays[0].date), 'desc');

export const selectLighthouseStatementGroups = createSelector(
  selectCopayDetail,
  copayDetail => {
    const grouped = groupBy(
      copayDetail?.attributes?.associatedStatements ?? [],
      'compositeId',
    );
    return sortGroupsByDateDesc(
      Object.entries(grouped).map(([compositeId, copays]) => ({
        statementId: compositeId,
        copays: sortCopaysByDateDesc(copays),
      })),
    );
  },
);

export const selectLighthousePreviousStatements = createSelector(
  selectLighthouseStatementGroups,
  groups =>
    groups.flatMap(group =>
      group.copays.map(copay => ({
        id: copay.id,
        invoiceDate:
          copay.attributes?.invoiceDate ?? copay.invoiceDate ?? copay.date,
      })),
    ),
);

export const useLighthouseMonthlyStatement = () => {
  const dispatch = useDispatch();
  const { statementId } = useParams();

  const copayDetail = useSelector(selectCopayDetail);
  const isLoading = useSelector(selectIsCopayDetailLoading);
  const groups = useSelector(selectLighthouseStatementGroups);

  const currentGroup = groups.find(g => g.statementId === statementId) ?? null;
  const mostRecentCopay = currentGroup?.copays[0] ?? null;
  const mostRecentCopayId = mostRecentCopay?.id ?? null;

  const needsCopayDetail =
    !isLoading &&
    mostRecentCopayId != null &&
    (copayDetail?.id == null || copayDetail.id !== mostRecentCopayId);

  if (needsCopayDetail) {
    dispatch(getCopayDetailStatement(mostRecentCopayId));
  }

  return {
    currentGroup,
    mostRecentCopay,
    copayDetail,
    isLoading,
  };
};
