// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MessinaArtCertificate is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    mapping(uint256 => string) private _artworkIds;

    mapping(string => uint256) private _tokenByArtworkId;

    event ArtworkCertified(
        uint256 indexed tokenId,
        string indexed artworkId,
        address indexed artist,
        string metadataURI
    );

    constructor()
        ERC721(
            "Messina Art Certificate",
            "MGAC"
        )
        Ownable(msg.sender)
    {}

    function certifyArtwork(
        address artistWallet,
        string memory artworkId,
        string memory metadataURI
    )
        external
        onlyOwner
        returns (uint256)
    {
        require(
            artistWallet != address(0),
            "Invalid artist wallet"
        );

        require(
            bytes(artworkId).length > 0,
            "Artwork ID required"
        );

        require(
            bytes(metadataURI).length > 0,
            "Metadata URI required"
        );

        require(
            _tokenByArtworkId[artworkId] == 0,
            "Artwork already certified"
        );

        _nextTokenId += 1;

        uint256 tokenId =
            _nextTokenId;

        _safeMint(
            artistWallet,
            tokenId
        );

        _setTokenURI(
            tokenId,
            metadataURI
        );

        _artworkIds[tokenId] =
            artworkId;

        _tokenByArtworkId[artworkId] =
            tokenId;

        emit ArtworkCertified(
            tokenId,
            artworkId,
            artistWallet,
            metadataURI
        );

        return tokenId;
    }

    function getArtworkId(
        uint256 tokenId
    )
        external
        view
        returns (string memory)
    {
        require(
            _ownerOf(tokenId) != address(0),
            "Token does not exist"
        );

        return _artworkIds[tokenId];
    }

    function getTokenIdByArtworkId(
        string memory artworkId
    )
        external
        view
        returns (uint256)
    {
        return _tokenByArtworkId[
            artworkId
        ];
    }

    function isArtworkCertified(
        string memory artworkId
    )
        external
        view
        returns (bool)
    {
        return
            _tokenByArtworkId[
                artworkId
            ] != 0;
    }
}