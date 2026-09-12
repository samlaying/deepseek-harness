# Agent Note: Antigravity session log migration

Status: implemented

## Problem

Antigravity sessions written with older message fields could not be loaded by the current persistence coordinator. The failures included generic message events, assistant messages without a current source object, and repeated turn numbers after a continuation.

## Decision

The persistence coordinator performs a narrow import migration for the known Antigravity records. It converts generic user and assistant messages into current message events, derives an assistant model source from the legacy model metadata, and renumbers repeated turn ids monotonically. Records that do not contain enough information for an unambiguous conversion remain rejected.

## Alternatives considered

**Delete the affected logs:** Rejected because valid conversation history remains recoverable and deletion loses user data.

**Accept every unknown event:** Rejected because skipping a required event can reconstruct an incorrect session.

## Consequences

The current reader can reconstruct the affected Antigravity sessions without weakening the unknown-event safety rule. Truly corrupted committed rows still require prefix recovery and are not silently discarded.
