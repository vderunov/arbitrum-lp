import {
  Alert,
  AlertIcon,
  AlertTitle,
  Button,
  FormControl,
  FormHelperText,
  Heading,
  Input,
  InputGroup,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useParams } from '@snx-v3/useParams';
import { useSelectedCollateralType } from '@synthetixio/react-sdk';
import React from 'react';
import { parseAmount } from './parseAmount';
import { renderAmount } from './renderAmount';
import { useAccountAvailableCollateral } from './useAccountAvailableCollateral';
import { useDelegateCollateral } from './useDelegateCollateral';
import { usePositionCollateral } from './usePositionCollateral';
import { useSelectedAccountId } from './useSelectedAccountId';
import { useSelectedPoolId } from './useSelectedPoolId';

export function Delegate() {
  const accountId = useSelectedAccountId();

  const [params] = useParams();

  const collateralType = useSelectedCollateralType({ collateralType: params.collateralType });
  const poolId = useSelectedPoolId();

  const { data: accountAvailableCollateral } = useAccountAvailableCollateral({
    accountId,
    tokenAddress: collateralType?.address,
  });

  const { data: positionCollateral } = usePositionCollateral({
    accountId,
    poolId,
    tokenAddress: collateralType?.address,
  });

  const [value, setValue] = React.useState('');
  const parsedAmount = parseAmount(value, collateralType?.decimals);

  const delegate = useDelegateCollateral({
    onSuccess: () => setValue(''),
  });

  return (
    <Stack
      gap={3}
      as="form"
      method="POST"
      action="#"
      onSubmit={(e) => {
        e.preventDefault();
        delegate.mutate(parsedAmount);
      }}
    >
      <Heading color="gray.50" fontSize="2rem" lineHeight="120%">
        Delegate
        <Text as="span" ml={4} fontSize="1rem" fontWeight="normal">
          Delegated: <b>{renderAmount(positionCollateral, collateralType)}</b>
        </Text>
      </Heading>
      {delegate.isError ? (
        <Alert status="error" maxWidth="40rem">
          <AlertIcon />
          <AlertTitle>{delegate.error.message}</AlertTitle>
        </Alert>
      ) : null}

      <FormControl>
        <InputGroup gap={3}>
          <Input
            required
            placeholder="Enter amount"
            value={value}
            onChange={(e) => {
              delegate.reset();
              setValue(e.target.value);
            }}
            maxWidth="10rem"
          />
          <Button
            type="submit"
            isLoading={delegate.isPending}
            isDisabled={
              !(
                parsedAmount.gt(0) &&
                accountAvailableCollateral &&
                accountAvailableCollateral.gte(parsedAmount) &&
                positionCollateral &&
                positionCollateral.add(parsedAmount).gte(0)
              )
            }
          >
            Delegate
            {parsedAmount.gt(0) ? ` ${renderAmount(parsedAmount, collateralType)}` : null}
          </Button>
        </InputGroup>
        <FormHelperText>
          Max: <b>{renderAmount(accountAvailableCollateral, collateralType)}</b>
        </FormHelperText>
      </FormControl>
    </Stack>
  );
}
