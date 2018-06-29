import React from 'react'
import { ListItem } from 'react-native-elements'

import FadeIn from '../../components/Animations/FadeIn'
import { Colors } from '../../components/DesignSystem'
import formatNumber from '../../utils/formatNumber'
import { ONE_TRX } from '../../services/client'

const ITEM_HEIGHT = 40

const TokenItem = ({ item, onPress }) => {
  const tokenValue = item.balance || item.price / ONE_TRX;
  return <FadeIn name={item.name}>
    <ListItem
      onPress={onPress}
      disabled={item.name === 'TRX'}
      titleStyle={{ color: Colors.primaryText }}
      containerStyle={{
        borderBottomColor: '#191a29',
        height: ITEM_HEIGHT,
        marginLeft: -24,
        justifyContent: 'center'
      }}
      underlayColor='#191a29'
      title={item.name}
      titleStyle={{
        padding: 6,
        borderRadius: 8,
        color: 'white'
      }}
      hideChevron
      badge={{
        value: `${formatNumber(tokenValue.toFixed(2)) || 0}`,
        textStyle: { color: Colors.primaryText },
      }}
    />
  </FadeIn>
}

export default TokenItem