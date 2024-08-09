// Remix Modules
import { useLocation, useParams } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

// External Modules
import { motion } from "framer-motion";
import { formatUnits, isAddress } from "viem";

// Internal Modules
import { useReadTroveStake } from "~/generated";
import { headlineVariants } from "~/lib/utils";

// Components
import Stats from "~/components/Stats";
import StakeDetailsForm from "./StakeDetailsForm";
import Withdrawal from "./Withdrawal";

export const meta: MetaFunction = () => {
  return [{ title: "Stake | Trove" }];
};

export default function StakeDetails() {
  const params = useParams();
  const location = useLocation();

  // In case of invalid address or id
  // Show error message
  if (!params.address || !params.id) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-4 sm:p-10">
        <div>
          <h1 className="mb-3 text-3xl font-semibold">Something went wrong!</h1>
          <p>
            You could open an issue on{" "}
            <a className="text-blue-400 transition-colors duration-200 hover:text-blue-600" href="">
              GitHub
            </a>{" "}
            to notify us about it
          </p>
          <p className="word-break-word">
            Path: <code>{location.pathname}</code>
          </p>
        </div>
      </div>
    );
  }

  if (!isAddress(params.address)) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-4 sm:p-10">
        <div>
          <h1 className="mb-3 text-3xl font-semibold">Invalid Address</h1>
          <p className="max-w-96">
            The address you provided is invalid. Please check the address and try again.
          </p>
        </div>
      </div>
    );
  }

  // Get data from smart contract
  const { data: stakeDetails } = useReadTroveStake({
    functionName: "stakeStatus",
    args: [params.address],
  });
  const { data: stakeClaimableRewards } = useReadTroveStake({
    functionName: "stakeClaimableRewards",
    args: [params.address, BigInt(Number(params.id))],
  });

  const stake = stakeDetails ? stakeDetails[Number(params.id)] : null;
  // Calculate reward
  const claimableRewards = stakeClaimableRewards
    ? Number(formatUnits(stakeClaimableRewards, 18)).toLocaleString()
    : 0;
  const unclaimedRewards =
    stakeClaimableRewards && stake
      ? Number(formatUnits(stakeClaimableRewards - stake.claimed, 18)).toLocaleString()
      : 0;

  return (
    <div className="mb-14">
      <motion.section
        variants={headlineVariants}
        initial="hidden"
        animate="visible"
        className="flex-1"
      >
        <h1
          className="mx-auto mb-1 mt-10 max-w-72 text-center text-2xl font-semibold !leading-relaxed
            min-[460px]:max-w-none sm:text-4xl lg:text-5xl lg:leading-snug"
        >
          Stake Details
        </h1>
        <article className="mx-auto w-full max-w-screen-xl">
          <Stats title="Uncollected Rewards" value={unclaimedRewards} className="w-full" center />
          <div className="mt-4 flex flex-col gap-4 md:flex-row">
            <div className="flex w-full flex-col gap-4 md:w-1/3">
              <Stats
                title="Token Staked"
                value={stake ? Number(formatUnits(stake.amount, 18)).toLocaleString() : 0}
                desc="TRV1"
              />
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-4 md:flex-col md:gap-5">
                <Stats
                  title="Stake Rewards"
                  value={claimableRewards}
                  desc="TRV2"
                  className="w-full sm:w-1/2 md:w-full"
                />
                <Stats
                  title="Claimed Rewards"
                  value={stake ? Number(formatUnits(stake.claimed, 18)).toLocaleString() : 0}
                  desc="TRV2"
                  className="w-full sm:w-1/2 md:w-full"
                />
              </div>
            </div>
            {stake && (
              <StakeDetailsForm stake={stake} address={params.address} id={Number(params.id)} />
            )}
          </div>
        </article>
        {stake && <Withdrawal address={params.address} id={Number(params.id)} />}
      </motion.section>
    </div>
  );
}