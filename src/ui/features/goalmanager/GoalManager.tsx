import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons'
import { faDollarSign, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date'
import 'date-fns'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { BaseEmoji } from 'emoji-mart'
import { updateGoal as updateGoalApi } from '../../../api/lib'
import { Goal } from '../../../api/types'
import { selectGoalsMap, updateGoal as updateGoalRedux } from '../../../store/goalsSlice'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import DatePicker from '../../components/DatePicker'
import EmojiPicker from '../../components/EmojiPicker'
import { Theme } from '../../components/Theme'
import AddIconButton from './AddIconButton'
import GoalIcon from './GoalIcon'

type Props = {
  goal: Goal
}

export function GoalManager(props: Props) {
  const dispatch = useAppDispatch()
  const goalFromRedux = useAppSelector(selectGoalsMap)[props.goal.id]
  
  // Use current values from redux store fallback to props if unavailable
  const currentGoal = goalFromRedux || props.goal

  const [name, setName] = useState<string>('')
  const [targetDate, setTargetDate] = useState<Date | null>(null)
  const [targetAmount, setTargetAmount] = useState<number | null>(null)
  const [icon, setIcon] = useState<string | null>(null)
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)

  // Consolidated effect hook to update local state cleanly
  useEffect(() => {
    setName(currentGoal.name ?? '')
    setTargetDate(currentGoal.targetDate ? new Date(currentGoal.targetDate) : null)
    setTargetAmount(currentGoal.targetAmount ?? null)
    setIcon(currentGoal.icon ?? null)
  }, [currentGoal.id, currentGoal.name, currentGoal.targetDate, currentGoal.targetAmount, currentGoal.icon])

  const updateNameOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextName = event.target.value
    setName(nextName)
    const updatedGoal: Goal = { ...currentGoal, name: nextName }
    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(currentGoal.id, updatedGoal)
  }

  const updateTargetAmountOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value

    if (val === '') {
      setTargetAmount(null)
      return
    }

    const nextTargetAmount = parseFloat(val)

    if (Number.isNaN(nextTargetAmount)) return

    setTargetAmount(nextTargetAmount)

    const updatedGoal: Goal = {
      ...currentGoal,
      targetAmount: nextTargetAmount,
    }

    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(currentGoal.id, updatedGoal)
  }

  const pickDateOnChange = (date: MaterialUiPickersDate) => {
    if (date != null) {
      const parsedDate = new Date(date as any)
      setTargetDate(parsedDate)
      const updatedGoal: Goal = { ...currentGoal, targetDate: parsedDate }
      dispatch(updateGoalRedux(updatedGoal))
      updateGoalApi(currentGoal.id, updatedGoal)
    }
  }

  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen)
  }

  const updateIcon = (emoji: BaseEmoji) => {
    const nextIcon = emoji.native
    setIcon(nextIcon)
    setIsEmojiPickerOpen(false)
    const updatedGoal: Goal = { ...currentGoal, icon: nextIcon }
    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(currentGoal.id, updatedGoal)
  }

  return (
    <GoalManagerContainer>
      <NameInput value={name} onChange={updateNameOnChange} />
      
      <IconContainer>
        {icon ? (
          <GoalIcon icon={icon} onClick={toggleEmojiPicker} />
        ) : (
          <AddIconButton hasIcon={false} onClick={toggleEmojiPicker} />
        )}
      </IconContainer>

      {isEmojiPickerOpen && (
        <EmojiPickerContainer>
          <EmojiPicker onClick={updateIcon} />
        </EmojiPickerContainer>
      )}

      <Group>
        <Field name="Target Date" icon={faCalendarAlt} />
        <Value>
          <DatePicker value={targetDate} onChange={pickDateOnChange} />
        </Value>
      </Group>

      <Group>
        <Field name="Target Amount" icon={faDollarSign} />
        <Value>
          <StringInput 
            type="number"
            value={targetAmount ?? ''} 
            onChange={updateTargetAmountOnChange} 
          />
        </Value>
      </Group>

      <Group>
        <Field name="Balance" icon={faDollarSign} />
        <Value>
          <StringValue>{currentGoal.balance}</StringValue>
        </Value>
      </Group>

      <Group>
        <Field name="Date Created" icon={faCalendarAlt} />
        <Value>
          <StringValue>
            {currentGoal.created ? new Date(currentGoal.created).toLocaleDateString() : ''}
          </StringValue>
        </Value>
      </Group>
    </GoalManagerContainer>
  )
}

type FieldProps = { name: string; icon: IconDefinition }

const Field = (props: FieldProps) => (
  <FieldContainer>
    <FontAwesomeIcon icon={props.icon} />
    <FieldName>{props.name}</FieldName>
  </FieldContainer>
)

const GoalManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  width: 100%;
  position: relative;
`

const Group = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
`

const IconContainer = styled.div`
  position: relative;
`

const EmojiPickerContainer = styled.div`
  position: absolute;
  z-index: 10;
  top: 5rem;
  left: 0;
`

const NameInput = styled.input`
  display: flex;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 4rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};
`

const FieldName = styled.h1`
  font-size: 1.8rem;
  margin-left: 1rem;
  color: rgba(174, 174, 174, 1);
  font-weight: normal;
`

const FieldContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 20rem;
  svg {
    color: rgba(174, 174, 174, 1);
  }
`

const StringValue = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
`

const StringInput = styled.input`
  display: flex;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 1.8rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};
`

const Value = styled.div`
  margin-left: 2rem;
`