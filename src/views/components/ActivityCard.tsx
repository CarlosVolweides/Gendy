import React from 'react';
import styled from 'styled-components/native';
import { Text } from 'react-native-paper';

interface ActivityCardProps {
  date: string;
  title: string;
  description: string;
}

const CardContainer = styled.View`
  background-color: ${({ theme }: { theme: any }) => theme?.colors?.background || '#FFFFFF'};
  border-radius: 16px;
  padding: 16px;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  elevation: 2;
  border-width: 1px;
  border-color: ${({ theme }: { theme: any }) => theme?.colors?.surface || '#F3F4F6'};
  margin-bottom: 12px;
`;

const ContentRow = styled.View`
  flex-direction: row;
`;

const DateContainer = styled.View`
  flex-shrink: 0;
`;

const DateText = styled(Text)`
  color: #06B6D4;
  font-size: 14px;
`;

const ContentContainer = styled.View`
  flex: 1;
`;

const TitleText = styled(Text)`
  color: ${({ theme }: { theme: any }) => theme?.colors?.text || '#1F2937'};
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const DescriptionText = styled(Text)`
  color: #9CA3AF;
  font-size: 14px;
`;

export function ActivityCard({ date, title, description }: ActivityCardProps) {
  return (
    <CardContainer>
      <ContentRow>
        <DateContainer style={{ marginRight: 12 }}>
          <DateText>{date}</DateText>
        </DateContainer>
        <ContentContainer>
          <TitleText>{title}</TitleText>
          <DescriptionText>{description}</DescriptionText>
        </ContentContainer>
      </ContentRow>
    </CardContainer>
  );
}
