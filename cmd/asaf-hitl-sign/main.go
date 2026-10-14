// Command asaf-hitl-sign creates the HITL operator key and signs Hub
// approvals for POST /api/v1/hub/approve.
//
//	asaf-hitl-sign -keygen -key operator_mldsa87        # writes the key pair
//	asaf-hitl-sign -key operator_mldsa87 > approval.json  # one approval
//
// Start the Hub with ASAF_HITL_OPERATOR_KEY=operator_mldsa87.pub. Each
// approval is single-use and must reach the Hub within a few minutes.
package main

import (
	"crypto/rand"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"time"

	"github.com/nouchix/Adinkhepra-ASAF/pkg/asaf/hub"
	"github.com/nouchix/khepra-pqc/keyfile"
	"github.com/nouchix/khepra-pqc/sign"
)

func main() {
	keyPath := flag.String("key", "", "operator ML-DSA-87 private key file (public key at <key>.pub)")
	keygen := flag.Bool("keygen", false, "generate a new operator key pair at -key and -key.pub")
	flag.Parse()
	if *keyPath == "" {
		fmt.Fprintln(os.Stderr, "asaf-hitl-sign: -key is required")
		os.Exit(2)
	}
	if err := run(*keyPath, *keygen); err != nil {
		fmt.Fprintln(os.Stderr, "asaf-hitl-sign:", err)
		os.Exit(1)
	}
}

func run(keyPath string, keygen bool) error {
	if keygen {
		if _, err := os.Stat(keyPath); err == nil {
			return fmt.Errorf("%s already exists; refusing to overwrite", keyPath)
		}
		sk, err := sign.GenerateKey()
		if err != nil {
			return err
		}
		if err := keyfile.WriteSigningKey(keyPath, sk); err != nil {
			return err
		}
		if err := keyfile.WriteVerifyingKey(keyPath+".pub", sk.PublicKey()); err != nil {
			return err
		}
		fmt.Fprintf(os.Stderr, "wrote %s (mode 0600) and %s.pub\n", keyPath, keyPath)
		return nil
	}

	sk, err := keyfile.ReadSigningKey(keyPath)
	if err != nil {
		return err
	}
	nonce := make([]byte, 16)
	if _, err := rand.Read(nonce); err != nil {
		return err
	}
	req, err := hub.SignApproval(sk, time.Now(), nonce)
	if err != nil {
		return err
	}
	return json.NewEncoder(os.Stdout).Encode(req)
}
