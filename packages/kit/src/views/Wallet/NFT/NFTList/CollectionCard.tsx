import { memo, useMemo } from 'react';
import type { FC } from 'react';

import { Row } from 'native-base';

import {
  Box,
  Center,
  HStack,
  Text,
  useIsVerticalLayout,
  useTheme,
  useUserDevice,
} from '@onekeyhq/components';
import Pressable from '@onekeyhq/components/src/Pressable/Pressable';
import type { Collection } from '@onekeyhq/engine/src/types/nft';

import { FormatCurrencyNumber } from '../../../../components/Format';
import { useTokenPrice } from '../../../../hooks/useTokens';

import { NFTNetworkIcon } from './NetworkIcon';
import NFTListImage from './NFTListImage';

import type { ListDataType, ListItemComponentType, ListItemType } from './type';

const CountView: FC<{ count: number; size: number }> = ({ count, size }) => (
  <Box
    position="absolute"
    right="0"
    bottom="0"
    borderRadius="6px"
    size={`${size}px`}
    bgColor="backdrop"
  >
    <Center flex={1}>
      <Text>{`+${count}`}</Text>
    </Center>
  </Box>
);

type SubItemListProps = {
  collectible: Collection;
  width: number;
};

const SubItemList: FC<SubItemListProps> = ({ width, collectible }) => {
  const subItemSize = (width - 9) / 2;
  const filterAssets = collectible.assets.filter((_item, index) => index < 4);
  if (filterAssets.length === 1) {
    return (
      <NFTListImage
        asset={collectible.assets[0]}
        borderRadius="6px"
        size={width}
      />
    );
  }
  return (
    <Row
      flexWrap="wrap"
      width={`${width}px`}
      height={`${width}px`}
      borderRadius="6px"
    >
      {filterAssets.map((asset, itemIndex) => {
        const marginRight = !(itemIndex % 2 === 0) ? 0 : 9;
        const marginBottom = itemIndex < 2 ? 9 : 0;
        return (
          <NFTListImage
            key={`NFTListImage${
              asset.tokenId ?? asset.tokenAddress ?? ''
            }${itemIndex}`}
            asset={asset}
            borderRadius="6px"
            marginRight={`${marginRight}px`}
            marginBottom={`${marginBottom}px`}
            size={subItemSize}
          />
        );
      })}
      {collectible.assets.length > 4 ? (
        <CountView size={subItemSize} count={collectible.assets.length} />
      ) : null}
    </Row>
  );
};

export function keyExtractor(
  item: ListItemType<ListDataType>,
  index: number,
): string {
  const data = item.data as Collection;
  if (data.contractAddress) {
    return `Collection ${data.contractAddress}`;
  }
  if (data.contractName) {
    return `Collection ${data.contractName}`;
  }
  return `Collection ${index}`;
}

function CollectionCard({
  onSelect,
  data: collectible,
  ...rest
}: ListItemComponentType<Collection>) {
  const isSmallScreen = useIsVerticalLayout();
  const { screenWidth } = useUserDevice();

  const MARGIN = isSmallScreen ? 16 : 20;
  const padding = isSmallScreen ? 8 : 12;
  const width = isSmallScreen
    ? Math.floor((screenWidth - MARGIN * 3) / 2)
    : 177;
  const { themeVariant } = useTheme();
  const contentSize = width - 2 * padding;
  const price = useTokenPrice({
    networkId: collectible.networkId ?? '',
    tokenIdOnNetwork: '',
    vsCurrency: 'usd',
  });
  const value = price * (collectible.totalPrice ?? 0);
  return (
    <Box mb="16px" {...rest}>
      <Pressable
        bgColor="surface-default"
        padding={`${padding}px`}
        overflow="hidden"
        borderRadius="12px"
        borderColor="border-subdued"
        borderWidth={themeVariant === 'light' ? 1 : undefined}
        width={width}
        flexDirection="column"
        _hover={{ bg: 'surface-hovered' }}
        onPress={() => {
          if (onSelect) {
            onSelect(collectible);
          }
        }}
      >
        <Box position="relative">
          <SubItemList collectible={collectible} width={contentSize} />
          <NFTNetworkIcon networkId={collectible.networkId} />
        </Box>
        <HStack mt={`${padding}px`} justifyContent="space-between">
          <Text typography="Body2" height="20px" numberOfLines={1} flex={1}>
            {collectible.contractName}
          </Text>
        </HStack>
        <Text typography="Body2" height="20px" color="text-subdued">
          <FormatCurrencyNumber
            value={0}
            decimals={2}
            convertValue={value > 0 ? value : ''}
          />
        </Text>
      </Pressable>
    </Box>
  );
}

export default memo(CollectionCard);
