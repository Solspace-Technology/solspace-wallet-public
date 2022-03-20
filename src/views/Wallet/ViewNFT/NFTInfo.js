import {Dimensions, Image, ScrollView} from 'react-native';
import {Spinner, Text, Layout, Divider} from '@ui-kitten/components';
import axios from 'axios';
import {useQuery} from 'react-query';
import {useGetCurrentColorScheme} from '../../../hooks/useGetCurrentColorScheme';

export function NFTInfo({uri}) {
  let isDarkMode = useGetCurrentColorScheme() === 'dark';

  const [NftItemInfo, setNftItemInfo] = React.useState();
  const [imgHeight, setImgHeight] = React.useState();
  const imgWidth = Dimensions.get('window').width * 0.85;

  const [imgLoading, setImgLoading] = React.useState(false);

  async function getNFTInfo() {
    if (uri) {
      let result = await axios.get(uri);
      return result.data;
    }
  }
  const {isLoading, isError, data, error} = useQuery(
    [uri],
    () => getNFTInfo(),
    {enabled: !!uri},
  );

  React.useEffect(() => {
    if (data) {
      Image.getSize(data.image, (width, height) => {
        setImgHeight(height * (imgWidth / width));
      });
      setNftItemInfo(data);
    }
  }, [data, uri, imgWidth]);

  if (isLoading) {
    return (
      <ContentContainer>
        <Spinner size="giant" />
      </ContentContainer>
    );
  }

  if (NftItemInfo) {
    return (
      <ContentContainer>
        <ScrollView showsVerticalScrollIndicator={false}>
          <>
            {imgLoading && (
              // eslint-disable-next-line react-native/no-inline-styles
              <Layout style={{alignItems: 'center', justifyContent: 'center'}}>
                <Spinner size="giant" />
              </Layout>
            )}
            <Image
              onLoadStart={() => setImgLoading(true)}
              onLoadEnd={() => setImgLoading(false)}
              source={{uri: NftItemInfo?.image}}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{width: imgWidth, height: imgHeight, alignSelf: 'center'}}
            />
            {NftItemInfo.description && (
              <ItemContainer>
                <Text category="s1">Description: </Text>
                <Text>{NftItemInfo.description}</Text>
              </ItemContainer>
            )}
            {NftItemInfo.attributes &&
              NftItemInfo.attributes.map((attr, index) => (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  key={attr.value + index}>
                  <AttrRow isDarkMode={isDarkMode}>
                    <Text category="s1">
                      {attr.display_type || attr.trait_type}:
                    </Text>
                    <Text category="p1">{attr.value}</Text>
                  </AttrRow>
                </ScrollView>
              ))}
          </>
        </ScrollView>
      </ContentContainer>
    );
  }

  if (isError) {
    console.log(error);
    return (
      <ContentContainer>
        <Text status="danger" category="h3">
          Unable to Load NFT Data
        </Text>
      </ContentContainer>
    );
  }
  return null;
}

const AttrRow = styled(Layout)`
  min-width: 100%;
  flex-direction: row;
  padding: 15px 10px;
  margin: 2px 0;
  border-radius: 5px;
  border: solid 1px ${props => (props.isDarkMode ? '#ffffff25' : '#00000025')};
  justify-content: space-between;
  background-color: ${props => (props.isDarkMode ? '#ffffff25' : '#00000025')};
`;

const ItemContainer = styled(Layout)`
  margin: 15px 5px;
`;

const ContentContainer = styled(Layout)`
  flex: 1;
  padding: 20px;
  margin-top: 20px;
`;
