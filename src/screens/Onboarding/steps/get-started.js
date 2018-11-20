// @flow

import React, { Component, PureComponent } from "react";
import { StyleSheet, TouchableOpacity, View, Linking } from "react-native";
import { Trans } from "react-i18next";
import Icon from "react-native-vector-icons/dist/Feather";

import OnboardingLayout from "../OnboardingLayout";
import OnboardingStepWelcome from "./welcome";
import LText from "../../../components/LText";
import { withOnboardingContext } from "../onboardingContext";
import IconImport from "../../../icons/Import";
import IconCheck from "../../../icons/Check";
import IconRestore from "../../../icons/History";
import IconTruck from "../../../icons/Truck";
import colors from "../../../colors";
import type { OnboardingStepProps } from "../types";
import { urls } from "../../../config/urls";
import { deviceNames } from "../../../wording";

const IconPlus = () => <Icon name="plus" color={colors.live} size={16} />;

class OnboardingStepGetStarted extends Component<OnboardingStepProps> {
  onInitialized = async () => {
    await this.props.setOnboardingMode("alreadyInitialized");
    this.props.next();
  };

  onInit = async () => {
    await this.props.setOnboardingMode("full");
    this.props.next();
  };

  onImport = async () => {
    await this.props.setOnboardingMode("qrcode");
    this.props.next();
  };

  onRestore = async () => {
    await this.props.setOnboardingMode("restore");
    this.props.next();
  };

  onBuy = () => Linking.openURL(urls.buyNanoX);
  onWelcome = () => this.props.setShowWelcome(false);

  render() {
    const { showWelcome } = this.props;

    if (showWelcome) {
      return (
        <OnboardingStepWelcome {...this.props} onWelcomed={this.onWelcome} />
      );
    }

    return (
      <OnboardingLayout isFull>
        <LText style={styles.title} secondary semiBold>
          <Trans i18nKey="onboarding.stepGetStarted.title" />
        </LText>
        <Row
          Icon={IconImport}
          label={<Trans i18nKey="onboarding.stepGetStarted.import" />}
          onPress={this.onImport}
        />
        <Row
          Icon={IconPlus}
          label={<Trans i18nKey="onboarding.stepGetStarted.initialize" />}
          onPress={this.onInit}
        />
        <Row
          Icon={IconRestore}
          label={<Trans i18nKey="onboarding.stepGetStarted.restore" />}
          onPress={this.onRestore}
        />
        <Row
          Icon={IconCheck}
          label={<Trans i18nKey="onboarding.stepGetStarted.initialized" />}
          onPress={this.onInitialized}
        />
        <Row
          Icon={IconTruck}
          label={
            <Trans
              i18nKey="onboarding.stepGetStarted.buy"
              values={deviceNames.nanoX}
            />
          }
          onPress={this.onBuy}
        />
      </OnboardingLayout>
    );
  }
}

type RowProps = {
  Icon: React$ComponentType<*>,
  label: string | React$Element<*>,
  onPress: () => any,
};

class Row extends PureComponent<RowProps> {
  render() {
    const { onPress, label, Icon } = this.props;
    return (
      <TouchableOpacity onPress={onPress} style={styles.row}>
        <View style={styles.rowIcon}>
          {Icon && <Icon size={16} color={colors.live} />}
        </View>
        <LText style={styles.label} semiBold>
          {label}
        </LText>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    color: colors.darkBlue,
    marginVertical: 32,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.fog,
    borderRadius: 4,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: colors.darkBlue,
  },
  rowIcon: {
    width: 16,
    marginRight: 16,
  },
});

export default withOnboardingContext(OnboardingStepGetStarted);