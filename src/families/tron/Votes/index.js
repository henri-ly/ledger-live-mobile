// @flow
import React, { useCallback, useState, useMemo } from "react";
import { View, Linking, TouchableOpacity, StyleSheet } from "react-native";
import { withNavigation } from "react-navigation";
import { Trans } from "react-i18next";
import { BigNumber } from "bignumber.js";

import {
  getAccountUnit,
  getAccountCurrency,
} from "@ledgerhq/live-common/lib/account/helpers";
import {
  useTronSuperRepresentatives,
  formatVotes,
  getNextRewardDate,
  getLastVotedDate,
  MIN_TRANSACTION_AMOUNT,
} from "@ledgerhq/live-common/lib/families/tron/react";
import { getDefaultExplorerView } from "@ledgerhq/live-common/lib/explorers";

import type { NavigationScreenProp } from "react-navigation";
import type { Account } from "@ledgerhq/live-common/lib/types";

import { urls } from "../../../config/urls";
import Row from "./Row";
import Header from "./Header";
import LText from "../../../components/LText";
import Button from "../../../components/Button";
import colors from "../../../colors";
import ExternalLink from "../../../icons/ExternalLink";
import Info from "../../../icons/Info";
import ArrowRight from "../../../icons/ArrowRight";
import DateFromNow from "../../../components/DateFromNow";
import CurrencyUnitValue from "../../../components/CurrencyUnitValue";
import CounterValue from "../../../components/CounterValue";
import IlluRewards from "../IlluRewards";
import ProgressCircle from "../../../components/ProgressCircle";
import InfoModal from "../../../modals/Info";
import ClaimRewards from "../../../icons/ClaimReward";

const infoRewardsModalData = [
  {
    Icon: () => <ClaimRewards size={18} color={colors.darkBlue} />,
    title: <Trans i18nKey="tron.info.claimRewards.title" />,
    description: <Trans i18nKey="tron.info.claimRewards.description" />,
  },
];

type Props = {
  account: Account,
  parentAccount: ?Account,
  navigation: NavigationScreenProp<{
    params: {
      accountId: string,
      parentId: string,
    },
  }>,
};

const Delegation = ({ account, parentAccount, navigation }: Props) => {
  const [infoRewardsModal, setRewardsInfoModal] = useState();

  const superRepresentatives = useTronSuperRepresentatives();
  const lastVotedDate = useMemo(() => getLastVotedDate(account), [account]);

  const lastDate = lastVotedDate ? (
    <DateFromNow date={lastVotedDate.valueOf()} />
  ) : null;

  const currency = getAccountCurrency(account);
  const unit = getAccountUnit(account);
  const explorerView = getDefaultExplorerView(account.currency);
  const accountId = account.id;
  const parentId = parentAccount && parentAccount.id;

  const { spendableBalance, tronResources } = account;

  const canFreeze =
    spendableBalance && spendableBalance.gt(MIN_TRANSACTION_AMOUNT);

  const { votes, tronPower, unwithdrawnReward } = tronResources || {};

  const formattedUnwidthDrawnReward = BigNumber(unwithdrawnReward || 0);

  const formattedVotes = formatVotes(votes, superRepresentatives);

  const totalVotesUsed = votes.reduce(
    (sum, { voteCount }) => sum + voteCount,
    0,
  );

  const openRewardsInfoModal = useCallback(() => setRewardsInfoModal(true), [
    setRewardsInfoModal,
  ]);

  const closeRewardsInfoModal = useCallback(() => setRewardsInfoModal(false), [
    setRewardsInfoModal,
  ]);

  const claimRewards = useCallback(
    () =>
      navigation.navigate("ClaimRewardsConnectDevice", {
        accountId,
        parentId,
      }),
    [accountId, navigation, parentId],
  );

  const onDelegateFreeze = useCallback(
    () =>
      navigation.navigate("FreezeInfo", {
        accountId,
        parentId,
      }),
    [accountId, navigation, parentId],
  );

  const onManageVotes = useCallback(() => {
    navigation.navigate("CastVote", {
      accountId,
      parentId,
    });
  }, [navigation, accountId, parentId]);

  const onDelegate = useCallback(() => {
    const screenName = lastVotedDate ? "VoteSelectValidator" : "VoteStarted";
    navigation.navigate(screenName, {
      accountId,
      parentId,
    });
  }, [lastVotedDate, navigation, accountId, parentId]);

  const hasRewards = BigNumber(unwithdrawnReward).gt(0);
  const nextRewardDate = getNextRewardDate(account);

  const canClaimRewards = hasRewards && !nextRewardDate;

  const percentVotesUsed = totalVotesUsed / tronPower;

  return (
    <View style={styles.root}>
      {hasRewards || (tronPower > 0 && formattedVotes.length > 0) ? (
        <>
          <TouchableOpacity
            style={styles.labelContainer}
            onPress={openRewardsInfoModal}
          >
            <LText semiBold style={styles.label}>
              <Trans i18nKey="tron.voting.rewards.title" />
            </LText>
            <Info size={16} color={colors.darkBlue} />
          </TouchableOpacity>
          <View style={styles.rewardSection}>
            <View style={styles.labelSection}>
              <LText semiBold style={styles.title}>
                <CurrencyUnitValue
                  unit={unit}
                  value={formattedUnwidthDrawnReward}
                />
              </LText>
              <LText semiBold style={styles.subtitle}>
                {currency && (
                  <CounterValue
                    currency={currency}
                    value={formattedUnwidthDrawnReward}
                  />
                )}
              </LText>
            </View>
            <Button
              containerStyle={styles.collectButton}
              type="primary"
              event=""
              disabled={!canClaimRewards}
              onPress={claimRewards}
              title={<Trans i18nKey="tron.voting.rewards.button" />}
            />
          </View>
        </>
      ) : null}
      {tronPower > 0 ? (
        formattedVotes.length > 0 ? (
          <>
            <Header count={formattedVotes.length} onPress={onManageVotes} />
            <View style={[styles.container, styles.noPadding]}>
              {formattedVotes.map(
                ({ validator, address, voteCount, isSR }, index) => (
                  <Row
                    key={index}
                    validator={validator}
                    address={address}
                    amount={voteCount}
                    duration={lastDate}
                    explorerView={explorerView}
                    isSR={isSR}
                  />
                ),
              )}
              {percentVotesUsed < 1 && (
                <View style={[styles.container]}>
                  <TouchableOpacity onPress={onDelegate} style={styles.warn}>
                    <ProgressCircle
                      size={60}
                      progress={percentVotesUsed}
                      backgroundColor={colors.fog}
                    />
                    <View style={styles.warnSection}>
                      <LText
                        semiBold
                        style={[styles.warnText, styles.warnTitle]}
                      >
                        <Trans i18nKey="tron.voting.remainingVotes.title" />
                      </LText>
                      <LText style={styles.warnText}>
                        <Trans i18nKey="tron.voting.remainingVotes.description" />
                      </LText>
                    </View>

                    <ArrowRight size={16} color={colors.live} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            <View style={styles.labelContainer}>
              <LText semiBold style={styles.label}>
                <Trans i18nKey="tron.voting.votes.title" />
              </LText>
            </View>
            <View style={styles.container}>
              <View style={styles.container}>
                <LText style={styles.description}>
                  <Trans
                    i18nKey="tron.voting.votes.description"
                    values={{ name: account.currency.name }}
                  />
                </LText>
                <TouchableOpacity
                  style={styles.infoLinkContainer}
                  onPress={() => Linking.openURL(urls.tronStaking)}
                >
                  <LText bold style={styles.infoLink}>
                    <Trans i18nKey="tron.voting.howItWorks" />
                  </LText>
                  <ExternalLink size={11} color={colors.live} />
                </TouchableOpacity>
              </View>
              <Button
                type="primary"
                onPress={onDelegate}
                title={<Trans i18nKey="tron.voting.votes.cta" />}
                event=""
              />
            </View>
          </>
        )
      ) : (
        canFreeze && (
          <View style={styles.container}>
            <View style={styles.container}>
              <IlluRewards style={styles.illustration} />
              <LText semiBold style={styles.title}>
                <Trans i18nKey="tron.voting.earnRewars" />
              </LText>
              <LText style={styles.description}>
                <Trans
                  i18nKey="tron.voting.delegationEarn"
                  values={{ name: account.currency.name }}
                />
              </LText>
              <TouchableOpacity
                style={styles.infoLinkContainer}
                onPress={() => Linking.openURL(urls.tronStaking)}
              >
                <LText bold style={styles.infoLink}>
                  <Trans i18nKey="tron.voting.howItWorks" />
                </LText>
                <ExternalLink size={11} color={colors.live} />
              </TouchableOpacity>
            </View>
            <Button
              type="primary"
              disabled={!canFreeze}
              onPress={onDelegateFreeze}
              title={<Trans i18nKey="tron.voting.startEarning" />}
              event=""
            />
          </View>
        )
      )}
      <InfoModal
        isOpened={!!infoRewardsModal}
        onClose={closeRewardsInfoModal}
        data={infoRewardsModalData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    padding: 16,
  },
  container: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 4,
    flexDirection: "column",
    alignItems: "stretch",
  },
  illustration: { alignSelf: "center", marginBottom: 16 },
  noPadding: {
    padding: 0,
  },
  rewardSection: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  collectButton: {
    flexBasis: "auto",
    flexGrow: 0.5,
  },
  labelSection: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  label: {
    fontSize: 18,
    color: colors.darkBlue,
    marginRight: 6,
  },
  warn: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: colors.lightLive,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  warnSection: {
    flexDirection: "column",
    flex: 1,
    marginHorizontal: 6,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  warnTitle: {
    fontSize: 14,
  },
  warnText: {
    color: colors.live,
    marginLeft: 0,
    fontSize: 13,
  },
  cta: {
    flex: 1,
    flexGrow: 0.5,
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    textAlign: "center",
    paddingVertical: 4,
    color: colors.darkBlue,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 18,
    textAlign: "left",
    color: colors.grey,
  },
  description: {
    fontSize: 14,
    lineHeight: 17,
    paddingVertical: 8,
    textAlign: "center",
    color: colors.grey,
  },
  infoLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  infoLink: {
    fontSize: 13,
    lineHeight: 22,
    paddingVertical: 8,
    textAlign: "center",
    color: colors.live,
    marginRight: 6,
  },
});

const Votes = ({ account, parentAccount, navigation }: Props) => {
  if (!account || !account.tronResources) return null;

  return (
    <Delegation
      account={account}
      parentAccount={parentAccount}
      navigation={navigation}
    />
  );
};

export default withNavigation(Votes);
