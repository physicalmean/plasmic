// @ts-nocheck
/* eslint-disable */
/* tslint:disable */
/* prettier-ignore-start */

/** @jsxRuntime classic */
/** @jsx createPlasmicElementProxy */
/** @jsxFrag React.Fragment */

// This class is auto-generated by Plasmic; please do not edit!
// Plasmic Project: 4B48dRthR8uGgyaBYpWthR
// Component: BjPuqtCg-H

import * as React from "react";

import {
  Flex as Flex__,
  StrictProps,
  classNames,
  createPlasmicElementProxy,
  deriveRenderOpts,
} from "@plasmicapp/react-web";
import { useDataEnv } from "@plasmicapp/react-web/lib/host";

import "@plasmicapp/react-web/lib/plasmic.css";

import plasmic_plasmic_kit_design_system_css from "../PP__plasmickit_design_system.module.css"; // plasmic-import: tXkSR39sgCDWSitZxC5xFV/projectcss
import plasmic_plasmic_kit_color_tokens_css from "../plasmic_kit_q_4_color_tokens/plasmic_plasmic_kit_q_4_color_tokens.module.css"; // plasmic-import: 95xp9cYcv7HrNWpFWWhbcv/projectcss
import sty from "./PlasmicListBottomFade.module.css"; // plasmic-import: BjPuqtCg-H/css
import projectcss from "./plasmic_plasmic_kit_insert_panel.module.css"; // plasmic-import: 4B48dRthR8uGgyaBYpWthR/projectcss

createPlasmicElementProxy;

export type PlasmicListBottomFade__VariantMembers = {};
export type PlasmicListBottomFade__VariantsArgs = {};
type VariantPropType = keyof PlasmicListBottomFade__VariantsArgs;
export const PlasmicListBottomFade__VariantProps = new Array<VariantPropType>();

export type PlasmicListBottomFade__ArgsType = {};
type ArgPropType = keyof PlasmicListBottomFade__ArgsType;
export const PlasmicListBottomFade__ArgProps = new Array<ArgPropType>();

export type PlasmicListBottomFade__OverridesType = {
  root?: Flex__<"div">;
};

export interface DefaultListBottomFadeProps {
  className?: string;
}

const $$ = {};

function PlasmicListBottomFade__RenderFunc(props: {
  variants: PlasmicListBottomFade__VariantsArgs;
  args: PlasmicListBottomFade__ArgsType;
  overrides: PlasmicListBottomFade__OverridesType;
  forNode?: string;
}) {
  const { variants, overrides, forNode } = props;

  const args = React.useMemo(() => Object.assign({}, props.args), [props.args]);

  const $props = {
    ...args,
    ...variants,
  };

  const $ctx = useDataEnv?.() || {};
  const refsRef = React.useRef({});
  const $refs = refsRef.current;

  return (
    <div
      data-plasmic-name={"root"}
      data-plasmic-override={overrides.root}
      data-plasmic-root={true}
      data-plasmic-for-node={forNode}
      className={classNames(
        projectcss.all,
        projectcss.root_reset,
        projectcss.plasmic_default_styles,
        projectcss.plasmic_mixins,
        projectcss.plasmic_tokens,
        plasmic_plasmic_kit_design_system_css.plasmic_tokens,
        plasmic_plasmic_kit_color_tokens_css.plasmic_tokens,
        sty.root
      )}
    />
  ) as React.ReactElement | null;
}

const PlasmicDescendants = {
  root: ["root"],
} as const;
type NodeNameType = keyof typeof PlasmicDescendants;
type DescendantsType<T extends NodeNameType> =
  (typeof PlasmicDescendants)[T][number];
type NodeDefaultElementType = {
  root: "div";
};

type ReservedPropsType = "variants" | "args" | "overrides";
type NodeOverridesType<T extends NodeNameType> = Pick<
  PlasmicListBottomFade__OverridesType,
  DescendantsType<T>
>;

type NodeComponentProps<T extends NodeNameType> =
  // Explicitly specify variants, args, and overrides as objects
  {
    variants?: PlasmicListBottomFade__VariantsArgs;
    args?: PlasmicListBottomFade__ArgsType;
    overrides?: NodeOverridesType<T>;
  } & Omit<PlasmicListBottomFade__VariantsArgs, ReservedPropsType> & // Specify variants directly as props
    /* Specify args directly as props*/ Omit<
      PlasmicListBottomFade__ArgsType,
      ReservedPropsType
    > &
    /* Specify overrides for each element directly as props*/ Omit<
      NodeOverridesType<T>,
      ReservedPropsType | VariantPropType | ArgPropType
    > &
    /* Specify props for the root element*/ Omit<
      Partial<React.ComponentProps<NodeDefaultElementType[T]>>,
      ReservedPropsType | VariantPropType | ArgPropType | DescendantsType<T>
    >;

function makeNodeComponent<NodeName extends NodeNameType>(nodeName: NodeName) {
  type PropsType = NodeComponentProps<NodeName> & { key?: React.Key };
  const func = function <T extends PropsType>(
    props: T & StrictProps<T, PropsType>
  ) {
    const { variants, args, overrides } = React.useMemo(
      () =>
        deriveRenderOpts(props, {
          name: nodeName,
          descendantNames: PlasmicDescendants[nodeName],
          internalArgPropNames: PlasmicListBottomFade__ArgProps,
          internalVariantPropNames: PlasmicListBottomFade__VariantProps,
        }),
      [props, nodeName]
    );
    return PlasmicListBottomFade__RenderFunc({
      variants,
      args,
      overrides,
      forNode: nodeName,
    });
  };
  if (nodeName === "root") {
    func.displayName = "PlasmicListBottomFade";
  } else {
    func.displayName = `PlasmicListBottomFade.${nodeName}`;
  }
  return func;
}

export const PlasmicListBottomFade = Object.assign(
  // Top-level PlasmicListBottomFade renders the root element
  makeNodeComponent("root"),
  {
    // Helper components rendering sub-elements

    // Metadata about props expected for PlasmicListBottomFade
    internalVariantProps: PlasmicListBottomFade__VariantProps,
    internalArgProps: PlasmicListBottomFade__ArgProps,
  }
);

export default PlasmicListBottomFade;
/* prettier-ignore-end */
