import React from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Feather from 'react-native-vector-icons/Feather'

import IconButton from '../../components/IconButton'
import Badge from '../../components/Badge'
import * as Utils from '../../components/Utils'
import * as Elements from './Elements'
import NavigationHeader from '../../components/Navigation/Header'
import { Colors } from '../../components/DesignSystem'

class TransactionDetails extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: (
        <NavigationHeader
          title='TRANSACTION'
          onClose={() => navigation.goBack()}
          rightButton={
            <TouchableOpacity onPress={() => { }}>
              <Feather name='share-2' color='white' size={21} />
            </TouchableOpacity>
          }
        />
      )
    }
  }

  _renderCard = () => {
    return (
      <Utils.View
        background={Colors.secondaryText}
        borderRadius={10}
        marginRight={25}
        marginLeft={25}
        borderTopWidth={10}
        borderTopColor='#3FE77B'
      >
        <Utils.Content>
          <Elements.CardHeader>HASH</Elements.CardHeader>
          <Utils.VerticalSpacer />
          <Utils.Row align='center'>
            <Utils.View flex={1}>
              <Elements.CardText>4a1746f2f2842a8526185cf6f9f91b3217af564daa3c236358dbe3435e151476</Elements.CardText>
            </Utils.View>
            <Utils.HorizontalSpacer size='big' />
            <Utils.View>
              <IconButton icon='md-clipboard' bg='#66688F' iconColor='#FFFFFF' onPress={() => { }} />
            </Utils.View>
          </Utils.Row>
        </Utils.Content>
        <Utils.View height={1} marginLeftPercent={5} width='90%' background='black' />
        <Utils.Content>
          <Utils.Row>
            <Utils.View>
              <Elements.CardHeader>STATUS</Elements.CardHeader>
              <Utils.VerticalSpacer />
              <Elements.CardText>Confirmed</Elements.CardText>
            </Utils.View>
            <Utils.View flex={1} />
            <Utils.View>
              <Elements.CardHeader>BLOCK</Elements.CardHeader>
              <Utils.VerticalSpacer />
              <Elements.CardText>335019</Elements.CardText>
            </Utils.View>
            <Utils.View flex={1} />
            <Utils.View>
              <Elements.CardHeader>TIME</Elements.CardHeader>
              <Utils.VerticalSpacer />
              <Elements.CardText>07/06/2018 2:00 PM</Elements.CardText>
            </Utils.View>
          </Utils.Row>
        </Utils.Content>
      </Utils.View>
    )
  }

  _renderHeader = () => {
    return (
      <Utils.Content align='center'>
        <Badge bg='#3FE77B'>
          <Elements.BadgeText>VOTE</Elements.BadgeText>
        </Badge>
        <Utils.VerticalSpacer size='medium' />
        <Elements.CardHeader>AMOUNT</Elements.CardHeader>
        <Utils.VerticalSpacer />
        <Utils.Row align='center'>
          <Elements.AmountText>94.00</Elements.AmountText>
          <Utils.HorizontalSpacer size='medium' />
          <Badge bg={Colors.secondaryText}>
            <Elements.BadgeText>TRX</Elements.BadgeText>
          </Badge>
          <Utils.HorizontalSpacer size='medium' />
          <Ionicons
            name='ios-arrow-round-down'
            size={45}
            color='red'
          />
        </Utils.Row>
      </Utils.Content>
    )
  }

  _renderToFrom = () => {
    return (
      <Utils.Content>
        <Utils.Row justify='space-between' align='center'>
          <Elements.Label flex={1}>TO</Elements.Label>
          <Ionicons
            name='ios-arrow-round-up'
            size={45}
            color='green'
          />
        </Utils.Row>
        <Elements.CardText>4a1746f2f2842a8526185cf6f9f91b3217af564daa3c236358dbe3435e151476</Elements.CardText>
        <Utils.VerticalSpacer size='medium' />
        <Utils.View height={1} background='#51526B' />
        <Utils.Row justify='space-between' align='center'>
          <Elements.Label flex={1}>FROM</Elements.Label>
          <Ionicons
            name='ios-arrow-round-down'
            size={45}
            color='red'
          />
        </Utils.Row>
        <Elements.CardText>4a1746f2f2842a8526185cf6f9f91b3217af564daa3c236358dbe3435e151476</Elements.CardText>
      </Utils.Content>
    )
  }

  render () {
    return (
      <Utils.Container>
        <ScrollView>
          {this._renderHeader()}
          {this._renderCard()}
          {this._renderToFrom()}
          <Utils.Content>
            <Elements.Heading>Contracts</Elements.Heading>
            <Elements.SubHeading>Vote for a witness</Elements.SubHeading>
            <Utils.VerticalSpacer size='medium' />
            <Elements.Label>OWNER ADDRESS</Elements.Label>
            <Utils.VerticalSpacer />
            <Elements.Text>4a1746f2f2842a8526185cf6f9f91b3217af564daa3c236358dbe3435e151476</Elements.Text>
          </Utils.Content>
          <Utils.View height={1} background='#51526B' />
          <Utils.Content>
            <Elements.Heading>Votes</Elements.Heading>
            <Utils.Row align='center'>
              <Utils.View flex={1}>
                <Elements.Text>4a1746f2f2842a8526185cf6f9f91b3217af564daa3c236358dbe3435e151476</Elements.Text>
              </Utils.View>
              <Utils.HorizontalSpacer />
              <Utils.View>
                <Elements.Label>COUNT</Elements.Label>
                <Elements.Text>80,000</Elements.Text>
              </Utils.View>
            </Utils.Row>
            <Utils.VerticalSpacer size='medium' />
            <Utils.View height={1} background='#51526B' />
            <Utils.VerticalSpacer size='medium' />
            <Utils.Row align='center'>
              <Utils.View flex={1}>
                <Elements.Text>4a1746f2f2842a8526185cf6f9f91b3217af564daa3c236358dbe3435e151476</Elements.Text>
              </Utils.View>
              <Utils.HorizontalSpacer />
              <Utils.View>
                <Elements.Label>COUNT</Elements.Label>
                <Elements.Text>80,000</Elements.Text>
              </Utils.View>
            </Utils.Row>
          </Utils.Content>
        </ScrollView>
      </Utils.Container>
    )
  }
}

export default TransactionDetails
