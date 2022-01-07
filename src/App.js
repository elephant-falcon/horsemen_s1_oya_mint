import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import { Div, Button, Icon, Row, Col, Container, Tag, Anchor, Text, Image } from "atomize";

const HRSM_Center = { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' };
const HRSM_IMG_Center = { display: 'flex', justifyContent: 'center', alignItems: 'center' };

const mintLimit = 3;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click BUY to mint your NFT. There is a limit of ` + mintLimit + ` per wallet address.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [messageStatus, setStatus] = useState(`info300`);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_SYMBOL: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Almost there! Minting ${CONFIG.SYMBOL} now. Check your wallet for notifications.`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setStatus("warning300");
        setFeedback("Sorry, something went wrong [" + err.message + "] Please check your wallet and try again.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setStatus("success300");
        setFeedback(
          `You have successfully minted your ${CONFIG.SYMBOL}! Go visit Opensea.io to view it in your collection.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > mintLimit) {
      newMintAmount = mintLimit;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <Container h={{ xs: 'auto', md:  '100%' }}>

      <Div style={HRSM_Center}>

        <Row>

          <Col size={{ xs: 12, lg: 6 }} bg="black">

            <Div p="2rem">

              <Row>
                <Col size={{ xs: 4, lg: 4 }}></Col>
                <Col size={{ xs: 4, lg: 4 }}>
                  <Anchor target={"_blank"} href={"https://nft.griotenterprises.com"}>
                    <Image alt={"logo"} src={"/config/images/Horsemen-Logo-256.png"} />
                  </Anchor>
                </Col>
                <Col size={{ xs: 4, lg: 4 }}></Col>
              </Row>

              <Div shadow="1" w="100%" bg="white" rounded="md" p="1rem">

                <Text textAlign="center" textWeight="800">
                  You are minting
                </Text>
                <Text textAlign="center" textSize="heading" textWeight="800">
                  {CONFIG.NFT_NAME}
                </Text>
                <br />
                {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                  <>
                    <Text textAlign="center">
                      The sale has ended.
                    </Text>
                    <Text textAlign="center">
                      You can still find {CONFIG.NFT_SYMBOL} on
                      <Anchor target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                        {CONFIG.MARKETPLACE}
                      </Anchor>
                    </Text>
                  </>
                ) : (
                  <>
                    {blockchain.account === "" ||
                      blockchain.smartContract === null ? (
                      <Container>
                        <Text textAlign="center">
                          <Tag bg="gray300">
                            Connect to the {CONFIG.NETWORK.NAME} network
                          </Tag>
                        </Text>

                        <Div style={HRSM_IMG_Center}>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              dispatch(connect());
                              getData();
                            }}
                            prefix={
                              <Icon name="Add" size="18px" color="white" m={{ r: "0.5rem" }} />
                            }
                            hoverBg="success700" rounded="md" m={{ t: "0.5rem", b: "0.5rem" }} shadow="3" hoverShadow="4"
                            p={{ r: "1.5rem", l: "1rem" }}
                          >
                            Connect Wallet
                          </Button>
                        </Div>

                        {blockchain.errorMsg !== "" ? (
                          <Text textAlign="center">
                            <Tag bg="warning300">
                              {blockchain.errorMsg}
                            </Tag>
                          </Text>
                        ) : null}

                      </Container>
                    ) : (

                      <Div shadow="3" w="100%" bg="white" rounded="md" align="center" p="1rem" border="1px solid" borderColor="gray300">


                        {claimingNft ?
                          <Row>
                            <Col size={{ xs: 12 }}>
                              <Tag p="1rem" h="100%" w="100%" textAlign="Left" bg="success300">
                                {feedback}
                              </Tag>
                            </Col>
                          </Row>
                          :
                          <Row>
                            <Col size={{ xs: 12, lg: 6 }}>
                              <Tag p="1rem" h="100%" w="100%" textAlign="Left" 
                              >
                                1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                                {CONFIG.NETWORK.SYMBOL}, excluding gas fees*, and will
                                be minted directly to OpenSea.
                              </Tag>
                            </Col>
                            <Col size={{ xs: 12, lg: 6 }}>
                              <Tag p="1rem" h="100%" w="100%" textAlign="Left" bg={messageStatus}>
                                {feedback}
                              </Tag>
                            </Col>
                          </Row>
                        }


                        <br />
                        <Row>
                          <Col size={{ xs: 6, lg: 4 }} d="flex">

                            <Button bg="success700" hoverBg="warning800" rounded="md" w="50%"
                              m={{ r: "0.5rem" }}
                              disabled={claimingNft ? 1 : 0}
                              onClick={(e) => {
                                e.preventDefault();
                                decrementMintAmount();
                              }}
                            >
                              -
                            </Button>
                            <Button bg="success700" hoverBg="warning800" rounded="md" w="50%"
                              disabled={claimingNft ? 1 : 0}
                              onClick={(e) => {
                                e.preventDefault();
                                incrementMintAmount();
                              }}
                            >
                              +
                            </Button>

                          </Col>
                          <Col
                            size={{ xs: 2, lg: 4 }}
                            bg="gray300"
                          >

                            <Text textAlign="center" textSize="subheader" style={HRSM_Center}>
                              {mintAmount}
                            </Text>

                          </Col>
                          <Col size={{ xs: 4, lg: 4 }}>

                            <Button bg="success700" hoverBg="warning800" rounded="md" w="100%"

                              disabled={claimingNft ? 1 : 0}
                              onClick={(e) => {
                                e.preventDefault();
                                claimNFTs();
                                getData();
                              }}
                            >
                              {claimingNft ? 
                                <Icon name="Loading" size="18px" bg="success800" /> 
                                : "BUY"
                              }
                            </Button>

                          </Col>
                        </Row>

                      </Div>
                    )}
                  </>
                )}
              </Div>
              <br />

              <Row>

                <Col size={{ xs: 5, lg: 3 }}>
                  <Div shadow="1" w="100%" bg="white" rounded="md" d="flex" align="center" p="0.5rem">
                    <Tag
                      prefix={<Icon name="External" size="12px" color="black" m={{ r: "0.25rem" }} />}
                      bg="info300"
                      w="100%"
                    >
                      <Anchor target={"_blank"} href={CONFIG.SCAN_LINK}>
                        Contract
                      </Anchor>
                    </Tag>
                  </Div>
                </Col>
                <Col size={{ xs: 1, lg: 3 }}></Col>
                <Col size={{ xs: 3, lg: 3 }} style={HRSM_IMG_Center}>

                  <Image alt={"logo"} src={"/config/images/polygon-logo-inverted.png"} />

                </Col>
                <Col size={{ xs: 3, lg: 3 }} style={HRSM_IMG_Center}>

                  <Anchor target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                    <Image alt={"logo"} src={"/config/images/opensea-logo.png"} />
                  </Anchor>

                </Col>
              </Row>
              <br />

              <Div>
                <Text textColor="gray800" textSize="body">
                  <sup>*</sup>Make sure you are connected to the right network (
                  <Tag bg="dark">{CONFIG.NETWORK.NAME} </Tag>) and the correct address. We have set the gas limit
                  to <Tag bg="dark">{CONFIG.GAS_LIMIT}</Tag> for the contract to
                  successfully mint your {CONFIG.NFT_SYMBOL}. We recommend that you don't lower the gas limit. Please note:
                  Once you make the purchase, you cannot undo this action. 
                  All images and information &copy;2021-2022 Griot Enterprises and Elephant &amp; Falcon. All rights reserved.
                </Text>
              </Div>

            </Div>

          </Col>

          <Col
            size={{ xs: 12, lg: 6 }}
            minH="40rem"
            bg="gray700"
            bgImg="/config/images/covers/bkg-halftone-dark2.jpg"
            bgSize="cover"
          >
            <Div style={HRSM_Center}>

              <Row>
                <Col size={{ xs: 1, lg: 3 }}></Col>
                <Col size={{ xs: 10, lg: 6 }}>
                  <Image alt={"example"} src={"/config/images/proofs/preview.gif"} />
                </Col>
                <Col size={{ xs: 1, lg: 3 }}></Col>
              </Row>

            </Div>

          </Col>

        </Row>
      </Div>
    </Container>
  );
}

export default App;
